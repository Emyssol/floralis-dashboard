"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { Flower, Member } from "@/app/lib/types"
import GlobalSearch from "@/app/components/GlobalSearch"

interface Props {
  flowers: Flower[]
  members: Member[]  // já chegam filtrados para Baby
  onSelectMember: (m: Member) => void
  onSelectFlower: (f: Flower) => void
  onOpenAnalytics?: () => void
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

// A área de missões/competição saiu daqui — agora fica só na tela de
// Missões (MissoesView), que já cobre as duas guildas via GuildToggle.
// Esta página mostra só os cards das integrantes, no mesmo espírito da
// página "Matriz" (FloristasView), com a identidade visual verde da Baby.
export default function FloralisBabyView({ flowers, members, onSelectMember, onSelectFlower, onOpenAnalytics }: Props) {
  // ── Stats rápidos ──
  const emMissao = useMemo(() => members.filter((m) => m.status === "Em Missão"), [members])

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
      {onOpenAnalytics && (
        <button
          onClick={onOpenAnalytics}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "none", border: "none", padding: 0, marginBottom: 12,
            fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#7060A8",
            cursor: "pointer",
          }}
        >
          Ver analytics desta guilda →
        </button>
      )}

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
        </div>
      </div>

      {/* ── Integrantes ── */}
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
