"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  search?: string
  onSelectMember: (m: Member) => void
  onSelectFlower: (f: Flower) => void
}

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  "Em Missão": { bg: "#DCFCE7", color: "#15803D", dot: "#22c55e" },
  "Concluiu":  { bg: "#EFF6FF", color: "#2060C0", dot: "#60a5fa" },
  "Pausada":   { bg: "#FEF3C7", color: "#B45309", dot: "#f59e0b" },
  "Fora":      { bg: "#F1F5F9", color: "#64748B", dot: "#94a3b8" },
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// ── Modal de ranking flores em disputa ──
function DisputaModal({
  flowers,
  members,
  flowerCompetitionCount,
  onClose,
  onSelectFlower,
}: {
  flowers: Flower[]
  members: Member[]
  flowerCompetitionCount: Record<string, number>
  onClose: () => void
  onSelectFlower: (f: Flower) => void
}) {
  const ranked = Object.entries(flowerCompetitionCount)
    .sort((a, b) => b[1] - a[1])

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,10,40,0.45)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: 520,
          background: "white", borderRadius: 28, overflow: "hidden",
          maxHeight: "88vh",
          boxShadow: "0 24px 64px rgba(40,0,40,0.2)",
        }}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#d4608a", margin: 0 }}>
              🏆 Flores em Disputa
            </h2>
            <p style={{ fontSize: 12, color: "#c4a8c4", margin: "3px 0 0" }}>
              Ranking das flores mais usadas — apenas quem está <strong>Em Missão</strong>
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#f5eef8", color: "#b090c0",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Lista */}
        <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 90px)", padding: "16px 22px 20px" }}>
          {ranked.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36 }}>🌿</p>
              <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma flor em disputa no momento</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ranked.map(([name, count], i) => {
                const flower = flowers.find((f) => f.name === name)
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                // Floristas que usam essa flor na missão
                const users = members.filter(
                  (m) => m.status === "Em Missão" && m.favorites.includes(name)
                )
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null

                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      background: i < 3 ? cfg?.bg ?? "#FFF0F5" : "#fafafa",
                      border: `1px solid ${i < 3 ? cfg?.color ?? "#d4608a" : "#f0dded"}${i < 3 ? "33" : ""}`,
                      borderRadius: 16,
                      padding: "12px 14px",
                      cursor: flower ? "pointer" : "default",
                    }}
                    onClick={() => { flower && onSelectFlower(flower); onClose() }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Posição */}
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: i < 3 ? cfg?.color ?? "#d4608a" : "#f0e8ee",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: medal ? 16 : 12, fontWeight: 900,
                        color: i < 3 ? "white" : "#b89ab8",
                      }}>
                        {medal ?? `#${i + 1}`}
                      </div>

                      {/* Info flor */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#3a2a3a" }}>{name}</span>
                          {flower && (
                            <>
                              <span style={{
                                background: cfg?.bg, color: cfg?.color,
                                borderRadius: 999, padding: "1px 7px",
                                fontSize: 10, fontWeight: 800,
                              }}>{flower.rarity.split(" ")[1]}</span>
                              <span style={{ fontSize: 11, color: "#b07010" }}>⭐{flower.points}</span>
                            </>
                          )}
                        </div>
                        {/* Mini avatares de quem usa */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                          {users.map((m) => (
                            <span key={m.id} style={{
                              background: "white",
                              border: "1px solid #f0dded",
                              borderRadius: 999, padding: "1px 8px",
                              fontSize: 10, fontWeight: 600, color: "#9a7ab0",
                            }}>{m.name}</span>
                          ))}
                        </div>
                      </div>

                      {/* Contador */}
                      <div style={{
                        flexShrink: 0, textAlign: "center",
                        background: i < 3 ? cfg?.color ?? "#d4608a" : "#f0e8ee",
                        borderRadius: 12, padding: "6px 10px",
                        minWidth: 44,
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: i < 3 ? "white" : "#b89ab8", lineHeight: 1 }}>{count}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: i < 3 ? "rgba(255,255,255,0.8)" : "#c4a8c4", textTransform: "uppercase" }}>usando</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── View principal ──
export default function MissoesView({ flowers, members, search = "", onSelectMember, onSelectFlower }: Props) {
  const [filterStatus, setFilterStatus] = useState<string[]>(["Em Missão"])
  const [sortBy, setSortBy] = useState<"name" | "points" | "status">("status")
  const [showDisputa, setShowDisputa] = useState(false)

  const q = search.toLowerCase().trim()

  const missoes = useMemo(() => {
    return members
      .filter((m) => filterStatus.length === 0 || filterStatus.includes(m.status))
      .map((m) => {
        const compFlowers = flowers.filter((f) => m.favorites.includes(f.name))
        const totalPoints = compFlowers.reduce((acc, f) => acc + f.points, 0)
        return { member: m, compFlowers, totalPoints }
      })
      // Filtro por busca: nome da florista OU nome de flor na competição
      .filter(({ member, compFlowers }) => {
        if (!q) return true
        const matchMember = member.name.toLowerCase().includes(q)
        const matchFlower = compFlowers.some((f) => f.name.toLowerCase().includes(q))
        return matchMember || matchFlower
      })
      .sort((a, b) => {
        if (sortBy === "points") return b.totalPoints - a.totalPoints
        if (sortBy === "name")   return a.member.name.localeCompare(b.member.name)
        const order: Record<string, number> = { "Em Missão": 0, "Pausada": 1, "Concluiu": 2, "Fora": 3 }
        return (order[a.member.status] ?? 9) - (order[b.member.status] ?? 9)
      })
  }, [members, flowers, filterStatus, sortBy, q])

  // Contagem de flores: só quem está Em Missão
  const flowerCompetitionCount = useMemo(() => {
    const map: Record<string, number> = {}
    members
      .filter((m) => m.status === "Em Missão")
      .forEach((m) => {
        m.favorites.forEach((name) => {
          map[name] = (map[name] ?? 0) + 1
        })
      })
    return map
  }, [members])

  const emMissaoCount  = members.filter((m) => m.status === "Em Missão").length
  const concluidoCount = members.filter((m) => m.status === "Concluiu").length
  const disputaCount   = Object.keys(flowerCompetitionCount).length
  const allStatuses    = ["Em Missão", "Concluiu"]

  function toggleStatus(s: string) {
    setFilterStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Cabeçalho */}
        <div>
          <h2 style={{ fontSize: "clamp(18px,4vw,26px)", fontWeight: 900, color: "#3a2a3a", margin: 0 }}>
            🎯 Missões da Semana
          </h2>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#c4a8c4", marginTop: 4 }}>
            Flores que cada florista está usando na competição
          </p>
        </div>

        {/* Mini stats — 3 cards, o último clicável */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {/* Em Missão */}
          <div style={{
            background: "#DCFCE7", borderRadius: 14,
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            border: "1px solid #86efac44",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: 20, fontWeight: 900, color: "#15803D", lineHeight: 1 }}>{emMissaoCount}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", opacity: 0.85 }}>Em Missão</span>
          </div>

          {/* Concluíram */}
          <div style={{
            background: "#EFF6FF", borderRadius: 14,
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            border: "1px solid #93c5fd44",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
            <span style={{ fontSize: 20, fontWeight: 900, color: "#2060C0", lineHeight: 1 }}>{concluidoCount}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2060C0", opacity: 0.85 }}>Concluíram</span>
          </div>

          {/* Flores em disputa — CLICÁVEL */}
          <button
            onClick={() => setShowDisputa(true)}
            style={{
              background: "#FFF0F5", borderRadius: 14,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
              border: "1.5px solid #f9a8d4",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 2px 8px rgba(212,96,138,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,96,138,0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(212,96,138,0.1)"
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f9a8d4", display: "inline-block" }} />
            <span style={{ fontSize: 20, fontWeight: 900, color: "#d4608a", lineHeight: 1 }}>{disputaCount}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d4608a", opacity: 0.85 }}>Flores em disputa</span>
            <span style={{ fontSize: 11, color: "#d4608a", opacity: 0.5, marginLeft: 2 }}>→</span>
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#b89ab8" }}>
            Mostrar:
          </span>
          {allStatuses.map((s) => {
            const cfg = statusConfig[s]
            const active = filterStatus.includes(s)
            return (
              <button key={s} onClick={() => toggleStatus(s)} style={{
                background: active ? cfg.bg : "white",
                color: active ? cfg.color : "#9a7ab0",
                border: active ? `1.5px solid ${cfg.color}` : "1px solid #f0dded",
                borderRadius: 999, padding: "4px 12px",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 5,
                transition: "all 0.15s",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? cfg.dot : "#c4a8c4", display: "inline-block" }} />
                {s}
              </button>
            )
          })}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#b89ab8" }}>Ordenar:</span>
            {[
              { key: "status", label: "Status" },
              { key: "points", label: "Pontos" },
              { key: "name",   label: "Nome" },
            ].map((opt) => (
              <button key={opt.key} onClick={() => setSortBy(opt.key as any)} style={{
                background: sortBy === opt.key ? "#FFF0F5" : "white",
                color: sortBy === opt.key ? "#d4608a" : "#9a7ab0",
                border: sortBy === opt.key ? "1.5px solid #d4608a" : "1px solid #f0dded",
                borderRadius: 999, padding: "3px 10px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Lista de floristas */}
        {missoes.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ fontSize: 44 }}>🌿</p>
            <p style={{ marginTop: 12, fontWeight: 700, color: "#c4a8c4" }}>Nenhuma florista encontrada</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missoes.map(({ member, compFlowers, totalPoints }, i) => {
              const cfg = statusConfig[member.status] ?? statusConfig["Fora"]
              const ini = initials(member.name)
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  style={{
                    background: "white",
                    border: "1px solid #f2e8f0",
                    borderRadius: 18,
                    padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(180,100,140,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <button onClick={() => onSelectMember(member)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "linear-gradient(135deg, #f9d0e0, #e8d4f8)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 900, color: "white",
                        }}>{ini}</div>
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        <button onClick={() => onSelectMember(member)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: "#3a2a3a" }}>{member.name}</span>
                        </button>
                        <span style={{
                          background: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.dot}44`,
                          borderRadius: 999, padding: "2px 9px",
                          fontSize: 11, fontWeight: 800,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                          {member.status}
                        </span>
                        {totalPoints > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#b07010", marginLeft: "auto" }}>
                            ⭐ {totalPoints} pts totais
                          </span>
                        )}
                      </div>

                      {compFlowers.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {compFlowers.map((f) => {
                            const rcfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
                            const competingCount = flowerCompetitionCount[f.name] ?? 0
                            const isMatch = q && f.name.toLowerCase().includes(q)
                            return (
                              <button
                                key={f.id}
                                onClick={() => onSelectFlower(f)}
                                style={{
                                  background: isMatch ? (rcfg?.color ?? "#d4608a") : (rcfg?.bg ?? "#FFF0F5"),
                                  color: isMatch ? "white" : (rcfg?.color ?? "#d4608a"),
                                  border: `1.5px solid ${rcfg?.color ?? "#d4608a"}${isMatch ? "ff" : "30"}`,
                                  borderRadius: 999, padding: "3px 10px",
                                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  transition: "opacity 0.15s",
                                  boxShadow: isMatch ? `0 2px 8px ${rcfg?.color ?? "#d4608a"}44` : "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                              >
                                {f.name}
                                <span style={{ fontSize: 10 }}>· ⭐{f.points}</span>
                                {competingCount > 1 && (
                                  <span style={{
                                    background: isMatch ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
                                    borderRadius: 999, padding: "0 5px",
                                    fontSize: 9, fontWeight: 900,
                                    color: isMatch ? "white" : rcfg?.color,
                                  }}>{competingCount}×</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: "#c4a8c4", margin: 0 }}>
                          Sem flores para competição cadastradas
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Flores em Disputa */}
      <AnimatePresence>
        {showDisputa && (
          <DisputaModal
            key="disputa-modal"
            flowers={flowers}
            members={members}
            flowerCompetitionCount={flowerCompetitionCount}
            onClose={() => setShowDisputa(false)}
            onSelectFlower={(f) => { onSelectFlower(f); setShowDisputa(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}