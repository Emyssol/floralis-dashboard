import { NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { getDashboardData } from "@/app/lib/getDashboardData"
import { redis, MISSOES_CONCLUIDAS_KEY, PONTOS_EXTRA_KEY } from "@/app/lib/redis"
import { getMissoesMax } from "@/app/lib/missoesMax"
import type { Member } from "@/app/lib/types"

let cache: { data: any; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 min — o botão de atualizar manual força um refresh quando precisar

// Progresso semanal de missões (0-24) por florista — consulta rápida, feita
// SEMPRE, independente do cache em memória do Notion estar HIT ou MISS (não
// fica presa à TTL de 5 min como o resto).
async function getMissoesProgresso(): Promise<Record<string, number>> {
  try {
    const flat = await redis.hgetall<Record<string, unknown>>(MISSOES_CONCLUIDAS_KEY)
    if (!flat) return {}
    const progresso: Record<string, number> = {}
    for (const [floristaId, value] of Object.entries(flat)) {
      const n = Number(value)
      if (Number.isFinite(n) && n > 0) progresso[floristaId] = n
    }
    return progresso
  } catch (error) {
    console.error("[API Dashboard] Erro ao ler progresso de missões do Redis:", error)
    return {}
  }
}

// "Pontos extras" por par (florista, flor). A hash guarda campos achatados
// `${floristaId}::${flowerName}` → nº; aqui devolvemos aninhado:
// Record<florista_id, Record<flower_name, number>>. Dado permanente, mas a
// leitura é rápida e feita SEMPRE, fora da TTL do cache do Notion.
async function getPontosExtra(): Promise<Record<string, Record<string, number>>> {
  try {
    const flat = await redis.hgetall<Record<string, unknown>>(PONTOS_EXTRA_KEY)
    if (!flat) return {}
    const nested: Record<string, Record<string, number>> = {}
    for (const [field, value] of Object.entries(flat)) {
      const sep = field.indexOf("::")
      if (sep === -1) continue
      const floristaId  = field.slice(0, sep)
      const flowerName  = field.slice(sep + 2)
      const pontos = Number(value)
      if (!floristaId || !flowerName || !Number.isFinite(pontos) || pontos <= 0) continue
      ;(nested[floristaId] ??= {})[flowerName] = pontos
    }
    return nested
  } catch (error) {
    console.error("[API Dashboard] Erro ao ler pontos extras do Redis:", error)
    return {}
  }
}

// Ids com progresso >= teto da PRÓPRIA guilda da florista (24 na Matriz, 18
// na Baby — app/lib/missoesMax.ts) — mantido pro mesmo formato que
// MissoesView, WeeklySummary, FlowerModal e competitionRanking.ts já
// consomem (lista de quem "concluiu a semana"), sem precisar mexer em
// nenhum desses consumidores.
function derivarConcluidas(progresso: Record<string, number>, members: Member[]): string[] {
  const guildaPorFlorista: Record<string, string> = {}
  for (const m of members) guildaPorFlorista[m.id] = m.guild
  return Object.entries(progresso)
    .filter(([id, p]) => p >= getMissoesMax(guildaPorFlorista[id]))
    .map(([id]) => id)
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1"

  if (!forceRefresh && cache && Date.now() - cache.ts < CACHE_TTL) {
    const [missoesProgresso, pontosExtra] = await Promise.all([
      getMissoesProgresso(),
      getPontosExtra(),
    ])
    const missoesConcluidas = derivarConcluidas(missoesProgresso, cache.data.members)
    return NextResponse.json({ ...cache.data, missoesConcluidas, missoesProgresso, pontosExtra }, {
      headers: { "X-Cache": "HIT" },
    })
  }

  try {
    const [data, missoesProgresso, pontosExtra] = await Promise.all([
      getDashboardData(forceRefresh),
      getMissoesProgresso(),
      getPontosExtra(),
    ])
    cache = { data, ts: Date.now() }
    const missoesConcluidas = derivarConcluidas(missoesProgresso, data.members)
    return NextResponse.json({ ...data, missoesConcluidas, missoesProgresso, pontosExtra }, {
      headers: { "X-Cache": "MISS" },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar dados do Notion" }, { status: 500 })
  }
}
