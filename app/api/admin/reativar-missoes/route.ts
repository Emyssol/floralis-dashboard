import { NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"
import { redis, MISSOES_CONCLUIDAS_KEY } from "@/app/lib/redis"

// ── POST — admin zera o estado semanal na hora ("reativar todas agora") ──
// Mesmo efeito do cron de reset, mas disparado manualmente por uma admin.
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    if (!CARGOS_ADMIN.includes(session.user.cargo)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    await redis.del(MISSOES_CONCLUIDAS_KEY)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[API Reativar Missões] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
