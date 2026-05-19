"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onSelect: (f: Flower) => void
  onSelectMember: (m: Member) => void
}

function ownershipLabel(owners: number, total: number): { label: string; color: string } {
  if (owners === 0) return { label: "Ninguém tem", color: "#94a3b8" }
  if (owners === 1) return { label: "Exclusiva", color: "#d4608a" }
  if (owners <= 3)  return { label: "Poucas", color: "#c0304a" }
  if (owners <= 8)  return { label: "Algumas", color: "#7040b0" }
  return { label: "Popular", color: "#15803d" }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function SpotlightSearch({ flowers, members, onSelect, onSelectMember }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {flowers.map((flower, i) => {
        const rarity     = rarityConfig[flower.rarity as keyof typeof rarityConfig]
        const owners     = members.filter((m) => m.flowers.includes(flower.name))
        const nonOwners  = members.filter((m) => !m.flowers.includes(flower.name))
        const inMission  = members.filter((m) => m.status === "Em Missão" && m.favorites.includes(flower.name))
        const popularity = members.length > 0 ? flower.owners / members.length : 0
        const ownership  = ownershipLabel(flower.owners, members.length)

        return (
          <motion.div
            key={flower.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            style={{
              background: "white",
              border: "1px solid #f0dded",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(180,100,140,0.08)",
            }}
          >
            {/* Header clicável */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: 20, cursor: "pointer",
                background: rarity?.bg ?? "#FFF0F5",
              }}
              onClick={() => onSelect(flower)}
            >
              {/* Imagem */}
              <div style={{
                width: 72, height: 72, flexShrink: 0,
                borderRadius: 16, overflow: "hidden",
                background: rarity?.bg ?? "#FFF0F5",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {flower.image
                  ? <img src={flower.image} alt={flower.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36 }}>🌸</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#3a2a3a", margin: "0 0 8px" }}>
                  {flower.name}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ background: "white", color: rarity?.color, border: `1px solid ${rarity?.color}33`, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>
                    {flower.rarity}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.8)", color: ownership.color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>
                    {ownership.label}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.8)", color: "#b07010", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                    ⭐ {flower.points} pts
                  </span>
                </div>

                {/* Barra */}
                <div style={{ marginTop: 10, width: "100%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.6)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    width: `${Math.round(popularity * 100)}%`,
                    background: rarity?.color ?? "#d4608a",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: rarity?.color, marginTop: 4 }}>
                  {flower.owners} de {members.length} membros ({Math.round(popularity * 100)}%)
                </p>
              </div>

              {/* Contagem */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: rarity?.color ?? "#d4608a", lineHeight: 1 }}>
                  {flower.owners}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#b89ab8" }}>floristas</div>
              </div>
            </div>

            {/* Quem tem / não tem */}
            <div style={{ padding: "16px 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* ✅ Quem tem */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#15803D", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  ✅ Quem tem esta flor ({owners.length}):
                </p>
                {owners.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#b89ab8", fontWeight: 600 }}>Ninguém ainda</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {owners.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        style={{
                          background: "#DCFCE7", color: "#15803D",
                          border: "1px solid #86efac",
                          borderRadius: 999, padding: "3px 10px",
                          fontSize: 12, fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#bbf7d0",
                          fontSize: 9, fontWeight: 900, color: "#15803D",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {initials(m.name)}
                        </span>
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 🎯 Usando na competição */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#d4608a", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  🎯 Usando na competição ({inMission.length}):
                </p>
                {inMission.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#b89ab8", fontWeight: 600 }}>Ninguém está usando nas missões</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {inMission.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        style={{
                          background: "#FFF0F5", color: "#d4608a",
                          border: "1px solid #f9c8dc",
                          borderRadius: 999, padding: "3px 10px",
                          fontSize: 12, fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#f9c8dc",
                          fontSize: 9, fontWeight: 900, color: "#d4608a",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {initials(m.name)}
                        </span>
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}