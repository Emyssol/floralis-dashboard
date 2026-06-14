"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onOpenAnalytics?: () => void
}

// ── Modal: Floristas Em Missão ──────────────────────────────────────
function MissaoModal({ members, onClose }: { members: Member[]; onClose: () => void }) {
  const [search, setSearch] = useState("")

  const emMissao = useMemo(
    () => members.filter((m) => m.status === "Em Missão").sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [members]
  )

  const filtered = search.trim()
    ? emMissao.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : emMissao

  function initials(name: string) {
    const p = name.trim().split(/\s+/)
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase()
  }

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,10,40,0.45)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          width: "100%", maxWidth: 520, background: "white",
          borderRadius: "28px 28px 0 0", overflow: "hidden",
          maxHeight: "88vh", boxShadow: "0 -8px 40px rgba(40,0,40,0.2)",
        }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
        </div>
        {/* Header */}
        <div style={{ padding: "10px 20px 14px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#C8849E", margin: 0 }}>🎯 Floristas Em Missão</h2>
            <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>
              <strong style={{ color: "#22c55e" }}>{emMissao.length}</strong> floristas atualmente em missão
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>
        {/* Conteúdo */}
        <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 90px)", padding: "14px 16px 32px" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f4fb", border: "1.5px solid #eddde8", borderRadius: 12, padding: "8px 12px", marginBottom: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔎</span>
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar florista..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#3a2a3a" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#b89ab8" }}>✕</button>}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36 }}>🌿</p>
              <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma florista em missão</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#DCFCE733", border: "1px solid #86efac44",
                    borderRadius: 14, padding: "10px 14px",
                  }}
                >
                  {m.avatar
                    ? <img src={m.avatar} alt={m.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #f9d0e0, #e8d4f8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "white" }}>
                        {initials(m.name)}
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                    <p style={{ fontSize: 11, color: "#9a7ab0", fontWeight: 600, margin: 0 }}>
                      {m.favorites.length > 0 ? `${m.favorites.length} flor${m.favorites.length > 1 ? "es" : ""} na competição` : "Sem flores cadastradas"}
                    </p>
                  </div>
                  <span style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #86efac44", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    Em Missão
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Modal: Flores na Competição ─────────────────────────────────────
function CompetitionModal({ flowers, members, onClose }: { flowers: Flower[]; members: Member[]; onClose: () => void }) {
  const [search, setSearch] = useState("")

  const { ranked, total } = useMemo(() => {
    const count: Record<string, number> = {}
    members.filter((m) => m.status === "Em Missão").forEach((m) => {
      m.favorites.forEach((name) => { count[name] = (count[name] ?? 0) + 1 })
    })
    const all = Object.entries(count).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0], "pt-BR")
    })
    return { ranked: all, total: all.length }
  }, [members])

  const filtered = search.trim()
    ? ranked.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : ranked

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,10,40,0.45)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          width: "100%", maxWidth: 520, background: "white",
          borderRadius: "28px 28px 0 0", overflow: "hidden",
          maxHeight: "88vh", boxShadow: "0 -8px 40px rgba(40,0,40,0.2)",
        }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
        </div>
        {/* Header */}
        <div style={{ padding: "10px 20px 14px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#9B7FCC", margin: 0 }}>🏆 Flores na Competição</h2>
            <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>
              <strong style={{ color: "#9B7FCC" }}>{total}</strong> flores · apenas floristas Em Missão
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>
        {/* Conteúdo */}
        <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 90px)", padding: "14px 16px 32px" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f4fb", border: "1.5px solid #eddde8", borderRadius: 12, padding: "8px 12px", marginBottom: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔎</span>
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar flor..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#3a2a3a" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#b89ab8" }}>✕</button>}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36 }}>🌿</p>
              <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma flor na competição</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(([name, count], i) => {
                const flower = flowers.find((f) => f.name === name)
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                const users = members.filter((m) => m.status === "Em Missão" && m.favorites.includes(name)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    style={{
                      background: i < 3 ? cfg?.bg ?? "#FFF0F5" : "#fafafa",
                      border: `1px solid ${i < 3 ? (cfg?.color ?? "#9B7FCC") + "33" : "#f0dded"}`,
                      borderRadius: 14, padding: "10px 12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        background: i < 3 ? cfg?.color ?? "#9B7FCC" : "#f0e8ee",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: medal ? 14 : 11, fontWeight: 900,
                        color: i < 3 ? "white" : "#b89ab8",
                      }}>{medal ?? `#${i + 1}`}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#3a2a3a" }}>{name}</span>
                          {flower && (
                            <>
                              <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>{flower.rarity.split(" ")[1]}</span>
                              <span style={{ fontSize: 10, color: "#b07010" }}>⭐{flower.points}</span>
                            </>
                          )}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 5 }}>
                          {users.map((m) => (
                            <span key={m.id} style={{ background: "white", border: "1px solid #f0dded", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 600, color: "#9a7ab0" }}>{m.name}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "center", background: i < 3 ? cfg?.color ?? "#9B7FCC" : "#f0e8ee", borderRadius: 10, padding: "4px 8px", minWidth: 36 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: i < 3 ? "white" : "#b89ab8", lineHeight: 1 }}>{count}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: i < 3 ? "rgba(255,255,255,0.8)" : "#c4a8c4", textTransform: "uppercase" }}>usando</div>
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

// ── WeeklySummary principal ─────────────────────────────────────────
type ModalType = "missao" | "competicao" | "analytics" | null

interface StatItem {
  icon: string
  label: string
  accent: string
  tint: string
  border: string
  modal: ModalType
}

const statConfig: StatItem[] = [
  { icon: "/icons/mission.png",  label: "Em Missão",     accent: "#C8849E", tint: "rgba(232,184,203,0.10)", border: "rgba(232,184,203,0.26)", modal: "missao"     },
  { icon: "/icons/ranking.png",  label: "Em Competição", accent: "#9B7FCC", tint: "rgba(205,183,238,0.10)", border: "rgba(205,183,238,0.26)", modal: "competicao" },
  { icon: "/icons/grafics.png",  label: "Analytics",     accent: "#7060A8", tint: "rgba(205,183,238,0.10)", border: "rgba(205,183,238,0.26)", modal: "analytics"  },
]

export default function WeeklySummary({ flowers, members, onOpenAnalytics }: Props) {
  const [openModal, setOpenModal] = useState<ModalType>(null)

  const values = useMemo(() => {
    const mission = members.filter((m) => m.status === "Em Missão")
    const disputa = new Set(mission.flatMap((m) => m.favorites))
    return [mission.length, disputa.size, null] // Analytics não tem valor numérico
  }, [flowers, members])

  return (
    <>
      {/* Título no padrão section-title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p className="section-title">
          <img src="/icons/mission.png" alt="" width={14} height={14} style={{ objectFit: "contain" }} />
          Status da Semana
        </p>
      </div>

      <div className="weekly-pills">
        {statConfig.map((s, i) => {
          const clickable = s.modal !== null
          const Tag = motion.button
          const handleClick = clickable
            ? () => {
                if (s.modal === "analytics") onOpenAnalytics?.()
                else setOpenModal(s.modal as ModalType)
              }
            : undefined
          return (
            <Tag
              key={s.label}
              onClick={handleClick}
              whileHover={clickable ? { y: -2, boxShadow: "0 6px 18px rgba(160,100,140,0.14)" } : undefined}
              whileTap={clickable ? { scale: 0.97 } : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%",
                background: `linear-gradient(160deg, rgba(255,255,255,0.88) 0%, ${s.tint} 100%)`,
                border: clickable ? `1.5px solid ${s.accent}40` : `1px solid ${s.border}`,
                borderRadius: 18,
                padding: "14px 20px",
                boxShadow: "0 2px 10px rgba(160,100,140,0.05)",
                position: "relative", overflow: "hidden",
                cursor: clickable ? "pointer" : "default",
                transition: "box-shadow 0.2s ease",
                ...(clickable ? { fontFamily: "inherit" } : {}),
              }}
            >
              <img
                src="/ornaments/petals.png" alt="" aria-hidden
                style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", height: "130%", width: "auto", opacity: 0.05, mixBlendMode: "multiply", pointerEvents: "none", objectFit: "contain" }}
              />
              <img src={s.icon} alt="" width={24} height={24} style={{ objectFit: "contain", flexShrink: 0, position: "relative", zIndex: 1 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                {s.label === "Analytics" ? (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.accent, lineHeight: 1, letterSpacing: "-0.01em" }}>Analytics</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#B8A0B8", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      Ver mais
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: `${s.accent}22`, color: s.accent, fontSize: 9, fontWeight: 900 }}>→</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.accent, lineHeight: 1, letterSpacing: "-0.02em" }}>{values[i]}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#B8A0B8", marginTop: 2, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                      {s.label === "Em Missão" ? "Floristas em missão" : "Flores na competição"}
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: `${s.accent}22`, color: s.accent, fontSize: 9, fontWeight: 900 }}>→</span>
                    </div>
                  </>
                )}
              </div>
            </Tag>
          )
        })}
      </div>

      <AnimatePresence>
        {openModal === "missao" && (
          <MissaoModal key="missao" members={members} onClose={() => setOpenModal(null)} />
        )}
        {openModal === "competicao" && (
          <CompetitionModal key="competicao" flowers={flowers} members={members} onClose={() => setOpenModal(null)} />
        )}
      </AnimatePresence>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        .weekly-pills {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 480px) {
          .weekly-pills { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </>
  )
}