"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import { getActiveCompetitionMembers, getCompetitionRanking } from "@/app/lib/competitionRanking"
import { useGuildView, isBabyGuildString } from "@/app/lib/useGuildView"
import GuildToggle from "@/app/components/GuildToggle"
import InfoTooltip from "@/app/components/InfoTooltip"
import DisputaModal from "@/app/components/DisputaModal"

interface Props {
  flowers: Flower[]
  members: Member[]              // roster completo (as duas guildas) — o toggle interno escolhe qual fatia mostrar
  missoesConcluidas?: string[]
  pontosExtra?: Record<string, Record<string, number>>
  search?: string
  onSelectMember: (m: Member) => void
  onSelectFlower: (f: Flower) => void
}

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

// Paleta específica das tags de flor nesta tela — mais saturada que o
// rarityConfig padrão do app, pra dar mais hierarquia visual dentro do card
// de cada florista. Raridades fora dessa lista (N) caem no rarityConfig global.
const missoesRarityPalette: Record<string, { bg: string; border: string; text: string }> = {
  "❤️ UR":  { bg: "#FCE9EC", border: "#E4425A", text: "#C21F3B" },
  "💛 SSR": { bg: "#FDF3E1", border: "#EAA82C", text: "#A6690F" },
  "💜 SR":  { bg: "#F3E9FB", border: "#9333EA", text: "#7020B8" },
  "💙 R":   { bg: "#E9F1FC", border: "#4C8DF0", text: "#2E5FB0" },
}

function getMissoesFlowerColors(rarity: string) {
  const custom = missoesRarityPalette[rarity]
  if (custom) return custom
  const fallback = rarityConfig[rarity as keyof typeof rarityConfig]
  return { bg: fallback?.bg ?? "rgba(232,184,203,0.12)", border: fallback?.color ?? "#C8849E", text: fallback?.color ?? "#C8849E" }
}

const statusCfg: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  "Em Missão": { label: "Em Missão", bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", dot: "#5cb87a" },
  "Concluiu":  { label: "Concluiu",  bg: "rgba(205,183,238,0.20)", color: "#7B60B0", dot: "#9B7FCC" },
  "Pausada":   { label: "Pausada",   bg: "rgba(246,230,188,0.30)", color: "#B08040", dot: "#C8A050" },
  "Fora":      { label: "Fora",      bg: "rgba(200,160,190,0.12)", color: "#85667F", dot: "#B8A0B8" },
}

function initials(n: string) {
  const p = n.trim().split(/\s+/)
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase()
}

export default function MissoesView({ flowers, members, missoesConcluidas = [], pontosExtra = {}, search = "", onSelectMember, onSelectFlower }: Props) {
  const [filterStatus, setFilterStatus] = useState<string[]>(["Em Missão"])
  const [sortBy, setSortBy] = useState<"status" | "name" | "poucas">("status")
  const [showDisputa, setShowDisputa] = useState(false)
  const q = search.trim().toLowerCase()

  // Toggle Matriz/Baby — só de visualização (mesmo padrão do
  // FocoDaSemanaCard): nasce mostrando a guilda da conta logada, sem afetar
  // nenhuma ação de escrita (a tela já é só leitura; "concluir missões"
  // fica no MeuStatusCard/ProfileMenu, sempre atrelado à conta real).
  const [guildView, setGuildView] = useGuildView()
  const scopedMembers = useMemo(
    () => members.filter((m) => isBabyGuildString(m.guild) === (guildView === "baby")),
    [members, guildView]
  )

  // Floristas em missão que AINDA não marcaram "concluí minhas missões" —
  // só essas contam de verdade pra disputa/contagem de flores. Mesma
  // agregação usada em WeeklySummary (CompetitionModal) e FocoDaSemanaCard —
  // centralizada em app/lib/competitionRanking.ts.
  const activeMembers = useMemo(
    () => getActiveCompetitionMembers(scopedMembers, missoesConcluidas),
    [scopedMembers, missoesConcluidas]
  )

  const ranking = useMemo(() => getCompetitionRanking(activeMembers), [activeMembers])

  const flowerCompetitionCount = useMemo(() => {
    const c: Record<string, number> = {}
    ranking.forEach((r) => { c[r.name] = r.count })
    return c
  }, [ranking])

  const emMissaoCount  = scopedMembers.filter((m) => m.status === "Em Missão").length
  const concluidoCount = scopedMembers.filter((m) => m.status === "Concluiu").length
  const disputaCount   = ranking.length

  // Auto-focus + atalho "/" ficam no input real (SearchBar, renderizado pelo
  // Dashboard); aqui só o atalho de teclado, escopado à vida desta tela.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key !== "/") return
      const el = document.activeElement as HTMLElement | null
      const isTyping = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if (isTyping) return
      e.preventDefault()
      document.getElementById("floralis-search-input")?.focus()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const missoes = useMemo(() => {
    return scopedMembers
      .filter((m) => {
        if (!filterStatus.includes(m.status)) return false
        if (!q) return true
        return m.name.toLowerCase().includes(q) || m.favorites.some((f) => f.toLowerCase().includes(q))
      })
      .map((member) => {
        // Já concluiu as missões da semana? As flores dela somem da disputa
        // (não contam mais pra ninguém), mesmo que ela continue "Em Missão".
        const jaConcluiuSemana = missoesConcluidas.includes(member.id)
        const compFlowers = jaConcluiuSemana
          ? []
          : flowers
              .filter((f) => member.favorites.includes(f.name))
              .sort((a, b) => {
                const ri = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
                if (ri !== 0) return ri
                return a.name.localeCompare(b.name, "pt-BR")
              })
        return { member, compFlowers, jaConcluiuSemana }
      })
      .sort((a, b) => {
        // Sem nenhuma flor cadastrada pra competição (e não concluiu a
        // semana) vai sempre pro fim, não importa o critério — em qualquer
        // modo de ordenação.
        const aVazia = a.compFlowers.length === 0 && !a.jaConcluiuSemana
        const bVazia = b.compFlowers.length === 0 && !b.jaConcluiuSemana
        if (aVazia !== bVazia) return aVazia ? 1 : -1

        if (sortBy === "status") {
          const ord: Record<string, number> = { "Em Missão": 0, "Concluiu": 1 }
          const d = (ord[a.member.status] ?? 9) - (ord[b.member.status] ?? 9)
          return d !== 0 ? d : a.member.name.localeCompare(b.member.name, "pt-BR")
        }
        if (sortBy === "poucas") {
          const d = a.compFlowers.length - b.compFlowers.length
          return d !== 0 ? d : a.member.name.localeCompare(b.member.name, "pt-BR")
        }
        return a.member.name.localeCompare(b.member.name, "pt-BR")
      })
  }, [scopedMembers, flowers, filterStatus, sortBy, q, missoesConcluidas])

  const toggle = (s: string) =>
    setFilterStatus((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h2 style={{ fontSize: "clamp(17px,4vw,22px)", fontWeight: 800, color: "#4D3750", margin: 0, letterSpacing: "-0.01em" }}>
                Missões da Semana
              </h2>
              <InfoTooltip text="Mostra as flores que cada florista está usando na competição desta semana. Use a busca pra achar quem tem uma flor específica, e o ordenar 'Poucas flores' pra ver quem está atrasada." />
            </div>
            <p style={{ fontSize: 13, color: "#B8A0B8", marginTop: 4 }}>
              Flores que cada florista está usando na competição
            </p>
          </div>
          <GuildToggle value={guildView} onChange={setGuildView} />
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" as any, paddingBottom: 2 }}>
          {[
            { v: emMissaoCount,  l: "Em Missão",  bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", border: "rgba(212,234,216,0.45)" },
            { v: concluidoCount, l: "Concluíram", bg: "rgba(205,183,238,0.20)", color: "#7B60B0", border: "rgba(205,183,238,0.35)" },
          ].map((s) => (
            <div key={s.l} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999, padding: "7px 16px", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.v}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.l}</span>
            </div>
          ))}
          <button
            onClick={() => setShowDisputa(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(232,184,203,0.18)", border: "1px solid rgba(232,184,203,0.35)", borderRadius: 999, padding: "7px 16px", flexShrink: 0, cursor: "pointer" }}
          >
            <span style={{ fontSize: 15, fontWeight: 900, color: "#C8849E" }}>{disputaCount}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#C8849E" }}>Flores em disputa →</span>
          </button>
        </div>

        {/* Controles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Sticky junto com a busca (Dashboard) ao rolar — empilha por baixo
              do header sem precisar calcular offset em px: mesmo "top", ambos
              position:sticky, e o navegador empurra este pra baixo do outro. */}
          <div style={{
            position: "sticky", top: 0, zIndex: 39,
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            background: "rgba(255,248,251,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            padding: "8px 0", margin: "-8px 0 0",
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#B8A0B8", flexShrink: 0 }}>Mostrar:</span>
            {["Em Missão", "Concluiu"].map((s) => {
              const c = statusCfg[s]
              const active = filterStatus.includes(s)
              return (
                <button key={s} onClick={() => toggle(s)} style={{ background: active ? c.bg : "rgba(255,255,255,0.70)", color: active ? c.color : "#B8A0B8", border: active ? `1px solid ${c.dot}44` : "1px solid rgba(200,160,190,0.22)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.18s" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? c.dot : "#D0C0D0", display: "inline-block" }} />
                  {s}
                </button>
              )
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#B8A0B8", flexShrink: 0 }}>Ordenar:</span>
            {[{ k: "status", l: "Status" }, { k: "name", l: "Nome" }, { k: "poucas", l: "Poucas flores" }].map((o) => (
              <button key={o.k} onClick={() => setSortBy(o.k as any)} style={{ background: sortBy === o.k ? "rgba(232,184,203,0.20)" : "rgba(255,255,255,0.70)", color: sortBy === o.k ? "#C8849E" : "#B8A0B8", border: sortBy === o.k ? "1px solid rgba(200,132,158,0.30)" : "1px solid rgba(200,160,190,0.22)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.18s" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {missoes.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ fontSize: 44 }}>🌿</p>
            <p style={{ marginTop: 12, fontWeight: 700, color: "#B8A0B8" }}>Nenhuma florista encontrada</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missoes.map(({ member, compFlowers, jaConcluiuSemana }, i) => {
              const cfg = statusCfg[member.status] ?? statusCfg["Fora"]
              const ini = initials(member.name)
              // Sem nenhuma flor cadastrada pra competição — tratamento
              // visual mais discreto, já que fica sempre no fim da lista.
              const isVazia = compFlowers.length === 0 && !jaConcluiuSemana
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: isVazia ? "#FBF8F5" : "rgba(255,255,255,0.80)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${isVazia ? "#F0E6EA" : "rgba(200,160,190,0.18)"}`,
                    borderRadius: 16, padding: "12px 14px",
                    boxShadow: isVazia ? "none" : "0 2px 12px rgba(160,100,140,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: (compFlowers.length > 0 || jaConcluiuSemana) ? 10 : 0 }}>
                    <button onClick={() => onSelectMember(member)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
                      {member.avatar
                        ? <img src={member.avatar} alt={member.name} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />
                        : <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f5d0e0,#ddc8f4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "white" }}>{ini}</div>
                      }
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <button onClick={() => onSelectMember(member)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#4D3750" }}>{member.name}</span>
                        </button>
                        <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${cfg.dot}33` }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                          {member.status}
                        </span>
                        {jaConcluiuSemana && (
                          <span style={{ background: "rgba(155,127,204,0.14)", color: "#7040A8", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                            ✅ Concluiu as missões
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {jaConcluiuSemana ? (
                    <p style={{ fontSize: 12, color: "#9B7FCC", margin: 0, fontStyle: "italic" }}>
                      Já concluiu as missões desta semana — flores liberadas pra outras floristas
                    </p>
                  ) : compFlowers.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {compFlowers.map((f) => {
                        const colors = getMissoesFlowerColors(f.rarity)
                        const cc = flowerCompetitionCount[f.name] ?? 0
                        const bonus = pontosExtra[member.id]?.[f.name] ?? 0
                        // Bate com a busca? Destaca a tag em vez de só filtrar
                        // a lista — fecha o loop do deep-link "?flor=" vindo
                        // do Foco da Semana (chega aqui já filtrado, e a flor
                        // salta aos olhos dentro do card).
                        const isM = q && f.name.toLowerCase().includes(q)
                        return (
                          <button key={f.id} onClick={() => onSelectFlower(f)} style={{
                            background: colors.bg, color: colors.text,
                            border: `${isM ? 2 : 1}px solid ${isM ? "#EC4899" : colors.border}`,
                            borderRadius: 999, padding: "3px 9px",
                            fontSize: 10, fontWeight: isM ? 900 : 700,
                            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3,
                          }}>
                            {bonus > 0 && <span style={{ fontSize: 9, color: "#EAA82C" }} title={`+${bonus} pontos extras`}>⭐</span>}
                            <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>{f.name}</span>
                            <span style={{ fontSize: 8, opacity: 0.7, flexShrink: 0 }}>★{f.points}</span>
                            {cc > 1 && <span style={{ background: "rgba(255,255,255,0.65)", borderRadius: 999, padding: "0 4px", fontSize: 8, fontWeight: 900, color: colors.text, flexShrink: 0 }}>{cc}×</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: "#C4B6BE", fontStyle: "italic", margin: 0 }}>Sem flores para competição cadastradas</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDisputa && (
          <DisputaModal
            key="d"
            flowers={flowers}
            members={activeMembers}
            onClose={() => setShowDisputa(false)}
            onSelectFlower={(f) => { onSelectFlower(f); setShowDisputa(false) }}
          />
        )}
      </AnimatePresence>
      <style>{`div::-webkit-scrollbar{display:none;}`}</style>
    </>
  )
}