"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import DisputaModal from "@/app/components/DisputaModal"
import GlobalSearch from "@/app/components/GlobalSearch"

interface Props {
  flowers: Flower[]
  members: Member[]  // já chegam filtrados para Baby
  onSelectMember: (m: Member) => void
  onSelectFlower: (f: Flower) => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const cargoStyle: Record<string, { bg: string; color: string; icon: string }> = {
  Líder:       { bg: "#FEF3C7", color: "#B07010", icon: "👑" },
  "Co-Líder":  { bg: "#EDE5FB", color: "#7040B0", icon: "💎" },
  Ancião:      { bg: "#FFE4D4", color: "#C05010", icon: "🔥" },
  Elite:       { bg: "#E0ECFF", color: "#2060C0", icon: "🛡️" },
  Oficial:     { bg: "#FDE8F2", color: "#d4608a", icon: "⚔️" },
  Membro:      { bg: "#F0F5FF", color: "#3060C0", icon: "🌿" },
}

type Tab = "integrantes" | "missoes"

export default function FloralisBabyView({ flowers, members, onSelectMember, onSelectFlower }: Props) {
  const [tab, setTab] = useState<Tab>("integrantes")
  const [showDisputa, setShowDisputa] = useState(false)

  // ── Stats rápidos ──
  const emMissao = useMemo(() => members.filter((m) => m.status === "Em Missão"), [members])
  const flowerCompetitionCount = useMemo(() => {
    const c: Record<string, number> = {}
    emMissao.forEach((m) => m.favorites.forEach((n) => { c[n] = (c[n] ?? 0) + 1 }))
    return c
  }, [emMissao])
  const disputaCount = Object.keys(flowerCompetitionCount).length

  // ── Integrantes ordenados por nome ──
  const ranked = useMemo(() =>
    members
      .map((m) => ({
        member: m,
        count:    flowers.filter((f) => m.flowers.includes(f.name)).length,
        ssrCount: flowers.filter((f) => m.flowers.includes(f.name) && f.rarity === "💛 SSR").length,
        urCount:  flowers.filter((f) => m.flowers.includes(f.name) && f.rarity === "❤️ UR").length,
        prefCount: m.favorites.length,
      }))
      .sort((a, b) => a.member.name.localeCompare(b.member.name, "pt-BR")),
    [members, flowers]
  )
  const topCount = ranked[0]?.count ?? 1

  return (
    <>
      {/* Busca global — escopo Floralis Baby */}
      <div style={{ marginBottom: 16 }}>
        <GlobalSearch
          flowers={flowers}
          members={members}
          onSelectFlower={onSelectFlower}
          onSelectMember={onSelectMember}
          placeholder="Pesquisar flor ou integrante da Floralis Baby..."
          accentColor="#5A9070"
        />
      </div>

      {/* ── Header da seção ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(160,220,180,0.30), rgba(100,180,130,0.18))",
            border: "1px solid rgba(160,220,180,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>🌱</div>
          <div>
            <h2 style={{ fontSize: "clamp(17px,4vw,22px)", fontWeight: 800, color: "#3a6040", margin: 0, letterSpacing: "-0.01em" }}>
              Floralis Baby
            </h2>
            <p style={{ fontSize: 12, color: "#7aaa8a", margin: 0 }}>
              Guilda escola · {members.length} integrante{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Integrantes", value: members.length,        bg: "rgba(160,220,180,0.18)", color: "#4a8a5a", border: "rgba(160,220,180,0.38)" },
            { label: "Em Missão",   value: emMissao.length,       bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", border: "rgba(212,234,216,0.48)" },
            { label: "UR",          value: ranked.reduce((s,r) => s + r.urCount, 0),  bg: "rgba(232,184,203,0.18)", color: "#C8849E", border: "rgba(232,184,203,0.38)" },
          ].map((s) => (
            <div key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999, padding: "5px 14px" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
            </div>
          ))}
          {disputaCount > 0 && (
            <button
              onClick={() => setShowDisputa(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,184,203,0.18)", border: "1px solid rgba(232,184,203,0.35)", borderRadius: 999, padding: "5px 14px", cursor: "pointer" }}
            >
              <span style={{ fontSize: 14, fontWeight: 900, color: "#C8849E" }}>{disputaCount}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#C8849E" }}>Flores em disputa →</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["integrantes", "missoes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              borderRadius: 999, padding: "7px 18px", fontSize: 13, fontWeight: 800,
              cursor: "pointer",
              background: tab === t
                ? "linear-gradient(135deg, #5A9070, #3A7050)"
                : "rgba(255,255,255,0.72)",
              color: tab === t ? "white" : "#7aaa8a",
              boxShadow: tab === t ? "0 4px 14px rgba(80,160,110,0.25)" : "0 1px 4px rgba(0,0,0,0.04)",
              border: tab === t ? "none" : "1px solid rgba(160,220,180,0.30)",
            } as React.CSSProperties}
          >
            {t === "integrantes" ? "🌱 Integrantes" : "🎯 Missões"}
          </button>
        ))}
      </div>

      {/* ── Aba Integrantes ── */}
      {tab === "integrantes" && (
        <div className="baby-grid">
          {ranked.map(({ member, count, ssrCount, urCount, prefCount }, i) => {
            const cargo = cargoStyle[member.cargo] ?? cargoStyle["Membro"]
            const ini = initials(member.name)
            const barWidth = topCount > 0 ? (count / topCount) * 100 : 0

            return (
              <motion.button
                key={member.id}
                onClick={() => onSelectMember(member)}
                style={{
                  background: "white",
                  border: "1px solid rgba(160,220,180,0.30)",
                  borderRadius: 16,
                  boxShadow: "0 2px 12px rgba(80,160,110,0.08)",
                  overflow: "hidden",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: 0,
                  position: "relative",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 340, damping: 28 }}
                whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(80,160,110,0.18)" }}
              >
                <div style={{ position: "absolute", top: 8, right: 8, fontSize: 12, opacity: 0.4 }}>🔍</div>

                <div style={{
                  height: 90, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #edfff3, #f0faff)", overflow: "hidden",
                }}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} style={{ width: "100%", height: 90, objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: "linear-gradient(135deg, #b8e8c8, #a0d4b8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 900, color: "white",
                      boxShadow: "0 4px 12px rgba(80,160,110,0.22)",
                    }}>{ini}</div>
                  )}
                </div>

                <div style={{ padding: "9px 11px 11px" }}>
                  <p style={{ fontWeight: 900, fontSize: 12, color: "#3a2a3a", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={member.name}>{member.name}</p>

                  <span style={{ background: cargo.bg, color: cargo.color, borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 800, display: "inline-block", marginBottom: 3 }}>
                    {cargo.icon} {member.cargo}
                  </span>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ background: "rgba(160,220,180,0.20)", color: "#4a8a5a", borderRadius: 999, padding: "2px 7px", fontSize: 9, fontWeight: 800, border: "1px solid rgba(160,220,180,0.38)", display: "inline-block" }}>
                      🧸 Floralis Baby
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 5 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#5A9070", lineHeight: 1 }}>{count}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#b89ab8" }}>flores</span>
                  </div>

                  <div style={{ width: "100%", height: 4, borderRadius: 999, background: "#e8f5ee", overflow: "hidden", marginBottom: 7 }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${barWidth}%`, background: "linear-gradient(90deg, #5A9070, #3A7050)", transition: "width 0.6s ease" }} />
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {urCount > 0 && <span style={{ background: "#fde8f0", color: "#d4608a", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>❤️ {urCount} UR</span>}
                    {ssrCount > 0 && <span style={{ background: "#fef6e0", color: "#b07010", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>💛 {ssrCount} SSR</span>}
                    {prefCount > 0 && <span style={{ background: "#f0eafb", color: "#7040b0", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>💎 {prefCount}</span>}
                  </div>
                </div>
              </motion.button>
            )
          })}

          {ranked.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "80px 0", textAlign: "center" }}>
              <p style={{ fontSize: 48 }}>🌱</p>
              <p style={{ marginTop: 16, fontWeight: 700, color: "#b89ab8" }}>Nenhuma integrante encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* ── Aba Missões ── */}
      {tab === "missoes" && (
        <BabyMissoesTab
          flowers={flowers}
          members={members}
          flowerCompetitionCount={flowerCompetitionCount}
          onSelectMember={onSelectMember}
          onSelectFlower={onSelectFlower}
        />
      )}

      <AnimatePresence>
        {showDisputa && (
          <DisputaModal
            key="d"
            flowers={flowers}
            members={members}
            onClose={() => setShowDisputa(false)}
            onSelectFlower={(f) => { onSelectFlower(f); setShowDisputa(false) }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .baby-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        @media (min-width: 640px) {
          .baby-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        }
      `}</style>
    </>
  )
}

// ── Sub-componente: lista de missões da Baby ──
function BabyMissoesTab({ flowers, members, flowerCompetitionCount, onSelectMember, onSelectFlower }: {
  flowers: Flower[]
  members: Member[]
  flowerCompetitionCount: Record<string, number>
  onSelectMember: (m: Member) => void
  onSelectFlower: (f: Flower) => void
}) {
  const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

  const missoes = useMemo(() => {
    return members
      .filter((m) => ["Em Missão", "Concluiu"].includes(m.status))
      .map((member) => {
        const compFlowers = flowers
          .filter((f) => member.favorites.includes(f.name))
          .sort((a, b) => {
            const ri = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
            return ri !== 0 ? ri : a.name.localeCompare(b.name, "pt-BR")
          })
        return { member, compFlowers }
      })
      .sort((a, b) => {
        const ord: Record<string, number> = { "Em Missão": 0, "Concluiu": 1 }
        const d = (ord[a.member.status] ?? 9) - (ord[b.member.status] ?? 9)
        return d !== 0 ? d : a.member.name.localeCompare(b.member.name, "pt-BR")
      })
  }, [members, flowers])

  function initials(n: string) {
    const p = n.trim().split(/\s+/)
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase()
  }

  const statusCfg: Record<string, { bg: string; color: string; dot: string }> = {
    "Em Missão": { bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", dot: "#5cb87a" },
    "Concluiu":  { bg: "rgba(205,183,238,0.20)", color: "#7B60B0", dot: "#9B7FCC" },
  }

  if (missoes.length === 0) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <p style={{ fontSize: 44 }}>🌿</p>
        <p style={{ marginTop: 12, fontWeight: 700, color: "#B8A0B8" }}>Nenhuma integrante em missão</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {missoes.map(({ member, compFlowers }, i) => {
        const cfg = statusCfg[member.status] ?? statusCfg["Em Missão"]
        const ini = initials(member.name)
        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(8px)", border: "1px solid rgba(160,220,180,0.22)", borderRadius: 16, padding: "12px 14px", boxShadow: "0 2px 12px rgba(80,160,110,0.06)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: compFlowers.length > 0 ? 10 : 0 }}>
              <button onClick={() => onSelectMember(member)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
                {member.avatar
                  ? <img src={member.avatar} alt={member.name} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />
                  : <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#b8e8c8,#a0d4b8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "white" }}>{ini}</div>
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
                </div>
              </div>
            </div>
            {compFlowers.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {compFlowers.map((f) => {
                  const rc = rarityConfig[f.rarity as keyof typeof rarityConfig]
                  const cc = flowerCompetitionCount[f.name] ?? 0
                  return (
                    <button key={f.id} onClick={() => onSelectFlower(f)}
                      style={{ background: rc?.bg ?? "rgba(160,220,180,0.12)", color: rc?.color ?? "#5A9070", border: `1px solid ${rc?.color ?? "#5A9070"}22`, borderRadius: 999, padding: "3px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>{f.name}</span>
                      <span style={{ fontSize: 8, opacity: 0.7, flexShrink: 0 }}>★{f.points}</span>
                      {cc > 1 && <span style={{ background: "rgba(255,255,255,0.65)", borderRadius: 999, padding: "0 4px", fontSize: 8, fontWeight: 900, color: rc?.color, flexShrink: 0 }}>{cc}×</span>}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#B8A0B8", margin: 0 }}>Sem flores para competição cadastradas</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}