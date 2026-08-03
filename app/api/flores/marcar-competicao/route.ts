import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"

// Mesmo nome de propriedade usado em getDashboardData.ts
const PROP_COMPETICAO = "🎖️ Flores para Competição"
const CARGOS_ADMIN = ["Líder", "Co-líder", "Ancião"]

// ── POST — substitui a seleção semanal de flores para competição ──
// Diferente da posse: aqui a lista é SUBSTITUÍDA inteira (não acrescentada),
// porque representa "as flores desta semana", não um histórico acumulado.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { florista_id, flores_ids } = await request.json()

    if (!florista_id || !Array.isArray(flores_ids)) {
      return NextResponse.json(
        { error: "Campos obrigatórios: florista_id, flores_ids (array)" },
        { status: 400 }
      )
    }

    // Só pode editar a própria lista — a não ser que seja admin editando por outra florista
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para editar as flores de competição dessa florista" },
        { status: 403 }
      )
    }

    // Substitui a relation inteira na página da própria florista
    await notion.pages.update({
      page_id: florista_id,
      properties: {
        [PROP_COMPETICAO]: {
          relation: flores_ids.map((id: string) => ({ id })),
        },
      },
    })

    return NextResponse.json({ success: true, total: flores_ids.length })

  } catch (error: any) {
    console.error("[API Marcar Competição] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}