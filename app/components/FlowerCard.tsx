"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

const originIcon: Record<string, string> = {
  Canteiro:                 "🌱",
  "Mercado de Flores":      "🛒",
  Astral:                   "💫",
  "Flor de Nível":          "🌿",
  Evento:                   "🎪",
  Moonlake:                 "🌙",
  "Recarga Acumulada":      "⚡",
  "Recompensas do Mercado": "🎁",
  "Pacote de Flores":       "📦",
  "Decreto Floral":         "📜",
  Desconhecida:             "🌺",
}

function popularityBarColor(owners: number, total: number): string {
  if (owners === 0) return "#ede8f0"
  const ratio = total > 0 ? owners / total : 0
  if (ratio >= 0.5) return "#6ee7a0"
  if (ratio >= 0.25) return "#a3d977"
  if (ratio >= 0.1) return "#fbbf5a"
  if (owners <= 3) return "#f09ab8"
  return "#b8a0e8"
}

interface Props {
  flower: Flower
  members?: Member[]
  totalMembers?: number
  onClick?: () => void
}

export default function FlowerCard({ flower, members = [], totalMembers = 1, onClick }: Props) {
  const rarity = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const popularity = totalMembers > 0 ? flower.owners / totalMembers : 0
  const icon = originIcon[flower.origin] ?? "🌺"
  const barColor = popularityBarColor(flower.owners, totalMembers)
  const ownerMembers = members.filter((m) => m.flowers.includes(flower.name))

  return (
    <motion.article
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "#ffffff",
        border: "1px solid #f2e8f0",
        borderRadius: 20,
        boxShadow: "0 1px 6px rgba(180,100,140,0.06), 0 4px 16px rgba(180,100,140,0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 4px 20px rgba(180,100,140,0.13)",
      }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      {/* Imagem */}
      <div style={{
        height: 110,
        background: rarity?.bg ?? "#FFF5F8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {flower.image ? (
          <img
            src={flower.image}
            alt={flower.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          />
        ) : (
          <span style={{ fontSize: 46, userSelect: "none", opacity: 0.85 }}>🌸</span>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "10px 11px 12px", flex: 1 }}>
        {/* Nome */}
        <p
          title={flower.name}
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: "#3a2a3a",
            marginBottom: 7,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >{flower.name}</p>

        {/* Raridade + donos */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <span style={{
            background: rarity?.bg ?? "#f5eef8",
            color: rarity?.color ?? "#9a7ab0",
            borderRadius: 999,
            padding: "2px 7px",
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}>{flower.rarity}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#c0a0c0" }}>
            {flower.owners} 👑
          </span>
        </div>

        {/* Barra */}
        <div style={{
          width: "100%", height: 5, borderRadius: 999,
          background: "#f5eef8", overflow: "hidden", marginBottom: 6,
        }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${Math.round(popularity * 100)}%`,
            background: barColor,
            transition: "width 0.6s ease",
          }} />
        </div>

        {/* Origem */}
        <p style={{
          fontSize: 10, fontWeight: 500, color: "#c4a8c0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {icon} {flower.origin}
        </p>

        {/* Donos — nomes */}
        {ownerMembers.length > 0 && (
          <p style={{
            fontSize: 10, fontWeight: 500, color: "#d090b8",
            marginTop: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {ownerMembers.slice(0, 2).map((m) => m.name).join(", ")}
            {ownerMembers.length > 2 && ` e +${ownerMembers.length - 2}`}
          </p>
        )}
      </div>
    </motion.article>
  )
}