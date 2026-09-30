import { NextRequest, NextResponse } from "next/server"
import { redis, MISSOES_CONCLUIDAS_KEY } from "@/app/lib/redis"

// ── GET — reset semanal automático do estado "concluí minhas missões" ──
// Chamado pelo Vercel Cron (ver vercel.json). O Vercel injeta o header
// Authorization: Bearer ${CRON_SECRET} nessas chamadas — sem o secret bater,
// a rota recusa. Em produção só: cron não roda em ambiente local.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  await redis.del(MISSOES_CONCLUIDAS_KEY)

  return NextResponse.json({ success: true, resetAt: new Date().toISOString() })
}
