import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"

const PROP_SENHA = "🔑 Senha (hash)"

// ── POST — define ou troca a senha de login por e-mail/senha de uma florista ──
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { florista_id, nova_senha, senha_atual } = await request.json()

    if (!florista_id || typeof nova_senha !== "string") {
      return NextResponse.json(
        { error: "Campos obrigatórios: florista_id, nova_senha" },
        { status: 400 }
      )
    }

    if (nova_senha.length < 6) {
      return NextResponse.json(
        { error: "A nova senha precisa ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para definir a senha dessa florista" },
        { status: 403 }
      )
    }

    // Troca feita pela própria florista (não reset de admin) exige confirmar a senha atual,
    // mas só se ela já tiver uma senha cadastrada
    if (isSelf) {
      const page: any = await notion.pages.retrieve({ page_id: florista_id })
      const hashAtual: string | null = page.properties?.[PROP_SENHA]?.rich_text?.[0]?.plain_text ?? null

      if (hashAtual) {
        if (typeof senha_atual !== "string" || !senha_atual) {
          return NextResponse.json(
            { error: "Informe a senha atual" },
            { status: 400 }
          )
        }
        const senhaAtualValida = await bcrypt.compare(senha_atual, hashAtual)
        if (!senhaAtualValida) {
          return NextResponse.json(
            { error: "Senha atual incorreta" },
            { status: 401 }
          )
        }
      }
    }

    const novoHash = await bcrypt.hash(nova_senha, 10)

    await notion.pages.update({
      page_id: florista_id,
      properties: {
        [PROP_SENHA]: {
          rich_text: [{ text: { content: novoHash } }],
        },
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[API Senha] Erro:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
