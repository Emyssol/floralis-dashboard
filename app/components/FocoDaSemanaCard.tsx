"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import { getActiveCompetitionMembers, getCompetitionRanking } from "@/app/lib/competitionRanking"
import { useGuildView, isBabyGuildString } from "@/app/lib/useGuildView"
import { MISSOES_MAX_MATRIZ, MISSOES_MAX_BABY } from "@/app/lib/missoesMax"
import GuildToggle from "@/app/components/GuildToggle"
import InfoTooltip from "@/app/components/InfoTooltip"

interface Props {
  flowers: Flower[]
  members: Member[]              // roster completo (as duas guildas) — o toggle interno escolhe qual fatia mostrar
  missoesConcluidas?: string[]
  missoesProgresso?: Record<string, number>   // florista_id -> progresso, pra calcular "prioridade" e o total real em aberto
  pontosExtra?: Record<string, Record<string, number>>
  onFocusFlower: (flowerName: string) => void
}

// Top 2 floristas com mais missões restantes (teto da guilda - progresso)
// entre quem compete com essa flor — quem já teria zero restantes fica de
// fora (não deveria acontecer, já que `users` só tem quem ainda não
// concluiu, mas é uma proteção contra drift entre progresso e status).
function getPriorityHolders(users: Member[], missoesProgresso: Record<string, number>, missoesMax: number) {
  return users
    .map((u) => ({ user: u, restantes: missoesMax - (missoesProgresso[u.id] ?? 0) }))
    .filter((x) => x.restantes > 0)
    .sort((a, b) => b.restantes - a.restantes)
    .slice(0, 2)
}

// Widget "Foco da Semana" — top 5 flores mais disputadas, reaproveitando a
// mesma agregação de MissoesView/WeeklySummary (app/lib/competitionRanking),
// pra dar visibilidade na Home sem duplicar essa lógica de novo.
//
// Toggle Matriz/Baby é SÓ DE VISUALIZAÇÃO (useGuildView): troca qual guilda
// alimenta o ranking mostrado aqui, mas não afeta sessão nem nenhuma ação de
// escrita — os modais de posse/competição/pontos extras e o progresso de
// missões continuam sempre atrelados à guilda real da conta logada.
export default function FocoDaSemanaCard({ flowers, members, missoesConcluidas = [], missoesProgresso = {}, pontosExtra = {}, onFocusFlower }: Props) {
  const [guildView, setGuildView] = useGuildView()

  // Só esconde o card inteiro se NINGUÉM, em nenhuma guilda, estiver em
  // missão — senão a florista nunca descobriria que dá pra ver a outra.
  const allActiveMembers = useMemo(
    () => getActiveCompetitionMembers(members, missoesConcluidas),
    [members, missoesConcluidas]
  )
  if (allActiveMembers.length === 0) return null

  const scopedMembers = members.filter((m) => isBabyGuildString(m.guild) === (guildView === "baby"))
  const activeMembers = getActiveCompetitionMembers(scopedMembers, missoesConcluidas)
  const ranking = getCompetitionRanking(activeMembers).slice(0, 5)
  const floristasEmMissao = activeMembers.length
  // Todo mundo em `activeMembers` já é da mesma guilda (scopedMembers filtra
  // antes), então um teto só serve pra essa passada inteira.
  const missoesMax = guildView === "baby" ? MISSOES_MAX_BABY : MISSOES_MAX_MATRIZ

  // Total real de missões em aberto — soma (teto - progresso) de cada
  // florista ainda em missão, não uma estimativa. Desce a cada "+1 missão"
  // registrado por qualquer uma delas, não só quando alguém termina 100%.
  const missoesEmAberto = activeMembers.reduce(
    (soma, m) => soma + Math.max(0, missoesMax - (missoesProgresso[m.id] ?? 0)),
    0
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.90) 0%, rgba(205,183,238,0.10) 100%)",
        border: "1px solid rgba(205,183,238,0.28)",
        borderRadius: 20, padding: "16px 18px",
        marginBottom: 16,
        boxShadow: "0 2px 14px rgba(160,100,140,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#4D3750", margin: 0 }}>🎯 Foco da Semana</p>
          <InfoTooltip text="As 5 flores mais usadas na competição agora, com quem tem bônus e quem ainda tem mais missões pra terminar — pra saber o que priorizar procurar." />
        </div>
        <GuildToggle value={guildView} onChange={setGuildView} />
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#85667F", margin: "0 0 12px" }}>
        {floristasEmMissao > 0
          ? <>{floristasEmMissao} florista{floristasEmMissao > 1 ? "s" : ""} em missão · {missoesEmAberto.toLocaleString("pt-BR")} missões em aberto</>
          : `Ninguém em missão na ${guildView === "baby" ? "Floralis Baby" : "Floralis"} no momento`}
      </p>

      {ranking.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ranking.map((r, i) => {
            const flower = flowers.find((f) => f.name === r.name)
            const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
            const bonusHolders = r.users.filter((u) => (pontosExtra[u.id]?.[r.name] ?? 0) > 0)
            const priorityHolders = getPriorityHolders(r.users, missoesProgresso, missoesMax)
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`
            const bonusText = bonusHolders.length > 0 ? `⭐ ${bonusHolders.map((u) => u.name).join(", ")}` : "Sem bônus ainda"
            const priorityText = priorityHolders.length > 0
              ? `🎯 ${priorityHolders.map(({ user, restantes }) => `${user.name} (${restantes} restantes)`).join(", ")}`
              : ""
            return (
              <button
                key={r.name}
                onClick={() => onFocusFlower(r.name)}
                className="foco-row"
                style={{
                  background: i === 0 ? (cfg?.bg ?? "#F8F5FF") : "rgba(255,255,255,0.70)",
                  border: `1px solid ${i === 0 ? (cfg?.color ?? "#9B7FCC") + "33" : "rgba(200,160,190,0.18)"}`,
                }}
              >
                <span className="foco-medal">{medal}</span>
                <div className="foco-row-body">
                  <div className="foco-col-name">
                    {flower && <span className="foco-rarity-icon">{flower.rarity.split(" ")[0]}</span>}
                    <span className="foco-name-text">{r.name}</span>
                  </div>
                  <div className="foco-col-count">{r.count} competindo</div>
                  <div className="foco-col-bonus" style={{ color: bonusHolders.length > 0 ? "#9F1239" : "#B8A0B8" }} title={bonusText}>
                    {bonusText}
                  </div>
                  <div className="foco-col-priority" title={priorityText || undefined}>
                    {priorityText}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <style>{`
        .foco-row {
          display: flex; align-items: center; gap: 10px; text-align: left;
          border-radius: 14px; padding: 9px 12px; cursor: pointer; font-family: inherit;
          width: 100%;
        }
        .foco-medal {
          font-size: 13px; font-weight: 900; width: 22px; text-align: center; flex-shrink: 0;
        }
        .foco-row-body {
          display: flex; flex-direction: column; gap: 3px;
          flex: 1; min-width: 0;
        }
        .foco-col-name {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 800; color: #3a2a3a;
          min-width: 0;
        }
        .foco-name-text {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .foco-col-count {
          font-size: 10px; font-weight: 700; color: #9B7FCC;
        }
        .foco-col-bonus, .foco-col-priority {
          font-size: 10px; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .foco-col-priority { color: #EC4899; }

        /* Desktop: as 4 informações viram colunas lado a lado em vez de
           empilhadas — em telas estreitas o empilhado é mais legível. */
        @media (min-width: 640px) {
          .foco-row-body { flex-direction: row; align-items: center; gap: 14px; }
          .foco-col-name { flex: 1 1 30%; }
          .foco-col-count { flex: 0 0 80px; }
          .foco-col-bonus { flex: 1 1 32%; }
          .foco-col-priority { flex: 1 1 32%; text-align: right; }
        }
      `}</style>
    </motion.div>
  )
}
