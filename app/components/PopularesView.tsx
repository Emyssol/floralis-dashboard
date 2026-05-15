"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import FlowerCard from "@/app/components/FlowerCard"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onSelect: (f: Flower) => void
}

function SectionTitle({ emoji, title, subtitle, count }: {
  emoji: string; title: string; subtitle: string; count?: number
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <h2 style={{ fontSize: "clamp(15px,3vw,18px)", fontWeight: 900, color: "#3a2a3a", margin: 0 }}>
        {emoji} {title}
      </h2>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#c4a8c4" }}>{subtitle}</span>
      {count !== undefined && (
        <span style={{
          background: "#FFF0F5", color: "#d4608a",
          borderRadius: 999, padding: "1px 8px",
          fontSize: 12, fontWeight: 800,
          marginLeft: 2,
        }}>{count}</span>
      )}
    </div>
  )
}

export default function PopularesView({ flowers, members, onSelect }: Props) {
  const sorted     = [...flowers].sort((a, b) => b.owners - a.owners)
  const mostPop    = sorted.filter((f) => f.owners > 0).slice(0, 6)
  const leastOwned = sorted.filter((f) => f.owners > 0).slice(-6).reverse()
  const unowned    = sorted.filter((f) => f.owners === 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* ── Mais Populares ── */}
      <section>
        <div style={{ marginBottom: 16 }}>
          <SectionTitle emoji="🌻" title="Mais Populares" subtitle="(mais membros possuem)" />
        </div>
        <div className="pop-grid">
          {mostPop.map((flower, i) => (
            <motion.div
              key={flower.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 340, damping: 28 }}
              style={{ position: "relative" }}
            >
              {/* Badge de ranking top 3 */}
              {i < 3 && (
                <div style={{
                  position: "absolute", top: -8, right: -8, zIndex: 10,
                  width: 24, height: 24, borderRadius: "50%",
                  background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : "#FFF0F5",
                  color: i === 0 ? "#b07010" : i === 1 ? "#606080" : "#d4608a",
                  border: `2px solid ${i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#f9a8d4"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 900,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}>
                  #{i + 1}
                </div>
              )}
              <FlowerCard
                flower={flower}
                members={members}
                totalMembers={members.length}
                onClick={() => onSelect(flower)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divisor decorativo */}
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, #f2e0ec, transparent)" }} />

      {/* ── Menos Populares ── */}
      {leastOwned.length > 0 && (
        <section>
          <div style={{ marginBottom: 16 }}>
            <SectionTitle emoji="🌿" title="Menos Populares" subtitle="(poucas floristas possuem)" />
          </div>
          <div className="pop-grid">
            {leastOwned.map((flower, i) => (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 340, damping: 28 }}
              >
                <FlowerCard
                  flower={flower}
                  members={members}
                  totalMembers={members.length}
                  onClick={() => onSelect(flower)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Divisor decorativo */}
      {unowned.length > 0 && (
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, #f2e0ec, transparent)" }} />
      )}

      {/* ── Sem Donos ── */}
      {unowned.length > 0 && (
        <section>
          <div style={{ marginBottom: 16 }}>
            <SectionTitle
              emoji="🕊️"
              title="Ninguém Tem Ainda"
              subtitle="flores que nenhuma florista possui"
              count={unowned.length}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unowned.map((f) => {
              const cfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
              return (
                <button
                  key={f.id}
                  onClick={() => onSelect(f)}
                  style={{
                    background: cfg?.bg ?? "#f5eef8",
                    color: cfg?.color ?? "#9a7ab0",
                    border: `1px solid ${cfg?.color ?? "#c4a8c4"}22`,
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {f.name}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <style>{`
        .pop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 480px) { .pop-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
        @media (min-width: 768px) { .pop-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
        @media (min-width: 1024px) { .pop-grid { grid-template-columns: repeat(6, 1fr); gap: 16px; } }
      `}</style>
    </div>
  )
}