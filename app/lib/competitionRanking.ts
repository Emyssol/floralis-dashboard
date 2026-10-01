import type { Member } from "@/app/lib/types"

export interface FlowerRankingEntry {
  name: string
  count: number
  users: Member[]   // já ordenados por nome
}

// Floristas que ainda "valem" pra disputa desta semana: em missão e que ainda
// não marcaram "concluí minhas missões" (estado do Redis). Mesmo critério já
// usado em MissoesView e no CompetitionModal de WeeklySummary — centralizado
// aqui pra não recalcular esse filtro em cada lugar que precisa dele.
export function getActiveCompetitionMembers(members: Member[], missoesConcluidas: string[] = []): Member[] {
  return members.filter((m) => m.status === "Em Missão" && !missoesConcluidas.includes(m.id))
}

// Ranking de flores por nº de floristas ativas competindo com ela — maior
// contagem primeiro, empate por ordem alfabética. Reaproveitado por
// MissoesView, WeeklySummary (CompetitionModal) e FocoDaSemanaCard.
export function getCompetitionRanking(activeMembers: Member[]): FlowerRankingEntry[] {
  const byName = new Map<string, Member[]>()
  for (const m of activeMembers) {
    for (const flowerName of m.favorites) {
      if (!byName.has(flowerName)) byName.set(flowerName, [])
      byName.get(flowerName)!.push(m)
    }
  }
  return Array.from(byName.entries())
    .map(([name, users]) => ({
      name,
      count: users.length,
      users: [...users].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    }))
    .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, "pt-BR"))
}
