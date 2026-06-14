"use client"

import { motion } from "framer-motion"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onSelectMember: (m: Member) => void
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

function guildBadge(guild: string) {
  if (!guild) return null
  const isBaby = guild.includes("Baby")
  return {
    label: isBaby ? "🧸 Floralis Baby" : "🦋 Floralis",
    bg:    isBaby ? "rgba(160,220,180,0.20)" : "rgba(232,184,203,0.18)",
    color: isBaby ? "#4a8a5a"               : "#C8849E",
    border:isBaby ? "rgba(160,220,180,0.38)" : "rgba(232,184,203,0.35)",
  }
}

export default function FloristasView({ flowers, members, onSelectMember }: Props) {
  const ranked = members
    .map((m) => ({
      member: m,
      count:    flowers.filter((f) => m.flowers.includes(f.name)).length,
      ssrCount: flowers.filter((f) => m.flowers.includes(f.name) && f.rarity === "💛 SSR").length,
      urCount:  flowers.filter((f) => m.flowers.includes(f.name) && f.rarity === "❤️ UR").length,
      prefCount: m.favorites.length,
    }))
    .sort((a, b) => a.member.name.localeCompare(b.member.name, "pt-BR"))

  const topCount = ranked[0]?.count ?? 1

  return (
    <>
      <div className="floristas-grid">
        {ranked.map(({ member, count, ssrCount, urCount, prefCount }, i) => {
          const cargo = cargoStyle[member.cargo] ?? cargoStyle["Membro"]
          const ini = initials(member.name)
          const barWidth = topCount > 0 ? (count / topCount) * 100 : 0
          const guild = guildBadge(member.guild)

          return (
            <motion.button
              key={member.id}
              onClick={() => onSelectMember(member)}
              style={{
                background: "white",
                border: "1px solid #f0dded",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(180,100,140,0.08)",
                overflow: "hidden",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
                position: "relative",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 340, damping: 28 }}
              whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(180,100,140,0.18)" }}
            >
              <div style={{ position: "absolute", top: 8, right: 8, fontSize: 12, opacity: 0.4 }}>🔍</div>

              {/* Avatar */}
              <div style={{
                height: 90,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #fff0f5, #f5eeff)",
                overflow: "hidden",
              }}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f4c7d7, #dcccf4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: "white",
                    boxShadow: "0 4px 12px rgba(212,96,138,0.2)",
                  }}>{ini}</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "9px 11px 11px" }}>
                <p style={{ fontWeight: 900, fontSize: 12, color: "#3a2a3a", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={member.name}>{member.name}</p>

                {/* Cargo */}
                <span style={{ background: cargo.bg, color: cargo.color, borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 800, display: "inline-block", marginBottom: 3 }}>
                  {cargo.icon} {member.cargo}
                </span>

                {/* Selo da guilda */}
                {guild && (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ background: guild.bg, color: guild.color, borderRadius: 999, padding: "2px 7px", fontSize: 9, fontWeight: 800, border: `1px solid ${guild.border}`, display: "inline-block" }}>
                      {guild.label}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 5 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#d4608a", lineHeight: 1 }}>{count}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#b89ab8" }}>flores</span>
                </div>

                <div style={{ width: "100%", height: 4, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", marginBottom: 7 }}>
                  <div style={{ height: "100%", borderRadius: 999, width: `${barWidth}%`, background: "linear-gradient(90deg, #d4608a, #9B4FD4)", transition: "width 0.6s ease" }} />
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {urCount > 0 && (
                    <span style={{ background: "#fde8f0", color: "#d4608a", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>❤️ {urCount} UR</span>
                  )}
                  {ssrCount > 0 && (
                    <span style={{ background: "#fef6e0", color: "#b07010", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>💛 {ssrCount} SSR</span>
                  )}
                  {prefCount > 0 && (
                    <span style={{ background: "#f0eafb", color: "#7040b0", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>💎 {prefCount}</span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}

        {ranked.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontSize: 48 }}>🌿</p>
            <p style={{ marginTop: 16, fontWeight: 700, color: "#b89ab8" }}>Nenhuma florista encontrada</p>
          </div>
        )}
      </div>

      <style>{`
        .floristas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        @media (min-width: 640px) {
          .floristas-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        }
      `}</style>
    </>
  )
}