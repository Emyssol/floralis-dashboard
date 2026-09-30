import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"
import { redis, PONTOS_EXTRA_KEY } from "@/app/lib/redis"

// ── POST — marca/altera/remove os "pontos extras" de um par (florista, flor) ──
// pontos: number | null   (null ou 0 = remover a marcação; válido é 1..4)
// Dado permanente: NÃO reseta toda semana, só muda quando a própria florista
// (ou uma admin) altera. Fica só no Redis, numa hash global.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { florista_id, flower_name, pontos } = await request.json()

    if (!florista_id || typeof flower_name !== "string" || !flower_name) {
      return NextResponse.json(
        { error: "Campos obrigatórios: florista_id, flower_name" },
        { status: 400 }
      )
    }

    // Só a própria florista — ou uma admin — pode mexer nos pontos extras dela
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para alterar os pontos extras dessa florista" },
        { status: 403 }
      )
    }

    const field = `${florista_id}::${flower_name}`

    // null ou 0 → remove
    if (pontos === null || pontos === 0) {
      await redis.hdel(PONTOS_EXTRA_KEY, field)
      return NextResponse.json({ success: true })
    }

    if (typeof pontos !== "number" || !Number.isInteger(pontos) || pontos < 1 || pontos > 4) {
      return NextResponse.json(
        { error: "pontos deve ser um inteiro de 1 a 4, ou null/0 para remover" },
        { status: 400 }
      )
    }

    await redis.hset(PONTOS_EXTRA_KEY, { [field]: pontos })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[API Pontos Extra] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
