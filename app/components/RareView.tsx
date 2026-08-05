"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower } from "@/app/lib/types"
import FlowerCard from "@/app/components/FlowerCard"

interface Props {
  flowers: Flower[]
  onSelect: (f: Flower) => void
}

const rareTiers = ["❤️ UR", "💛 SSR", "💜 SR"]

export default function RareView({ flowers, onSelect }: Props) {
  const spotlight =
    flowers.find((f) => f.rarity === "❤️ UR") ||
    flowers.find((f) => f.rarity === "💛 SSR")

  const groups = rareTiers
    .map((r) => ({
      rarity: r,
      cfg: rarityConfig[r as keyof typeof rarityConfig],
      flowers: flowers.filter((f) => f.rarity === r).sort((a, b) => b.points - a.points),
    }))
    .filter((g) => g.flowers.length > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Título */}
      <div>
        <h2 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#3a2a3a", margin: 0 }}>
          💎 Flores Raras
        </h2>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#c4a8c4", marginTop: 4 }}>
          As flores mais valiosas e difíceis de obter da guilda
        </p>
      </div>

      {/* Spotlight */}
      {spotlight && (() => {
        const cfg = rarityConfig[spotlight.rarity as keyof typeof rarityConfig]
        return (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onSelect(spotlight)}
            style={{
              cursor: "pointer",
              background: "linear-gradient(135deg, #fff8fb 0%, #f8f2ff 50%, #fff8ee 100%)",
              border: "1px solid #f5d8e8",
              borderRadius: 20,
              padding: "clamp(16px,3vw,28px)",
              boxShadow: "0 2px 16px rgba(212,96,138,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px,3vw,28px)",
              flexWrap: "wrap",
            }}
          >
            {/* Imagem */}
            <div style={{
              width: "clamp(72px,12vw,112px)",
              height: "clamp(72px,12vw,112px)",
              borderRadius: 16, overflow: "hidden", flexShrink: 0,
              background: cfg?.bg ?? "#FFF0F5",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {spotlight.image
                ? <img src={spotlight.image} alt={spotlight.name} style={{ width: "clamp(72px,12vw,112px)", height: "clamp(72px,12vw,112px)", objectFit: "cover" }} />
                : <span style={{ fontSize: 44 }}>🌸</span>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#c090c0", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
                ✨ Flor mais rara da guilda
              </p>
              <h3 style={{ fontSize: "clamp(18px,4vw,28px)", fontWeight: 900, color: "#3a2a3a", margin: "0 0 10px" }}>
                {spotlight.name}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  {spotlight.rarity}
                </span>
                <span style={{ background: "#FFFBEB", color: "#D97706", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  ⭐ {spotlight.points} pts
                </span>
                <span style={{ background: "#FFF5F8", color: "#d4608a", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  🌙 {spotlight.origin}
                </span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#b090c0", marginTop: 10 }}>
                Clique para ver detalhes completos →
              </p>
            </div>
          </motion.div>
        )
      })()}

      {/* Grupos por raridade — mesmo FlowerCard do resto */}
      {groups.map(({ rarity, cfg, flowers: group }, gi) => (
        <div key={rarity}>
          {/* Header da seção */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              background: cfg?.bg, color: cfg?.color,
              borderRadius: 999, padding: "3px 12px",
              fontSize: 13, fontWeight: 800,
            }}>
              {rarity}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#c4a8c4" }}>
              {group.length} flor{group.length !== 1 ? "es" : ""}
            </span>
            <div style={{ flex: 1, height: 1, background: "#f2e8f2" }} />
          </div>

          {/* Grid igual ao da coleção */}
          <div className="flower-grid">
            {group.map((flower, i) => (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.08 + i * 0.04, duration: 0.35 }}
              >
                <FlowerCard
                  flower={flower}
                  totalMembers={0}
                  onClick={() => onSelect(flower)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ fontSize: 48 }}>🌿</p>
          <p style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: "#c4a8c4" }}>
            Nenhuma flor rara cadastrada ainda
          </p>
        </div>
      )}

      <style>{`
        .flower-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 480px) { .flower-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
        @media (min-width: 768px) { .flower-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
        @media (min-width: 1024px) { .flower-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; } }
        @media (min-width: 1280px) { .flower-grid { grid-template-columns: repeat(6, 1fr); } }
        @media (min-width: 1600px) { .flower-grid { grid-template-columns: repeat(8, 1fr); } }
      `}</style>
    </div>
  )
}