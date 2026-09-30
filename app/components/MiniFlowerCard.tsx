"use client"

import { rarityConfig } from "@/app/lib/rarity"
import type { Flower } from "@/app/lib/types"

interface Props {
  flower: Flower
  selected?: boolean
  locked?: boolean       // sem posse — dim + cadeado + sem clique (usado no CompetitionFlowersModal)
  bonus?: number         // "+N" de pontos extras, se houver
  loading?: boolean      // requisição em andamento pra este card específico
  onClick?: () => void
}

// Cartão compacto de flor com estado de seleção — usado nos modais de ação
// em lote (marcar posse / atualizar competição), onde o clique alterna um
// estado em vez de abrir o detalhe da flor (diferente do FlowerCard).
export default function MiniFlowerCard({ flower, selected = false, locked = false, bonus = 0, loading = false, onClick }: Props) {
  const rarity = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const clickable = !!onClick && !locked && !loading

  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        textAlign: "left", fontFamily: "inherit",
        background: "rgba(255,255,255,0.85)",
        border: selected ? `2px solid ${rarity?.color ?? "#d4608a"}` : "1px solid rgba(200,160,190,0.20)",
        borderRadius: 18,
        overflow: "hidden",
        cursor: clickable ? "pointer" : locked ? "default" : "not-allowed",
        opacity: locked ? 0.45 : loading ? 0.6 : 1,
        boxShadow: selected ? `0 4px 16px ${rarity?.color ?? "#d4608a"}33` : "0 2px 10px rgba(160,100,140,0.06)",
        transition: "all 0.18s ease",
        padding: 0,
      }}
    >
      <div style={{
        height: 88, position: "relative", flexShrink: 0,
        background: `linear-gradient(160deg, ${rarity?.bg ?? "#FFF5F8"}, rgba(255,255,255,0.6))`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {flower.image
          ? <img src={flower.image} alt={flower.name} style={{ width: "100%", height: 88, objectFit: "cover", objectPosition: "center 30%" }} />
          : <span style={{ fontSize: 32, opacity: 0.5 }}>🌸</span>
        }

        {selected && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 20, height: 20, borderRadius: "50%",
            background: rarity?.color ?? "#d4608a", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900,
            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          }}>✓</span>
        )}

        {bonus > 0 && (
          // Estrela — ícone padronizado de bônus/pontos extras em todo o app
          // (coração já é raridade UR, troféu já é "preferida pra competição").
          <span style={{
            position: "absolute", top: 6, left: 6,
            background: "#FDF3E1", color: "#A6690F", border: "1px solid #EAA82C",
            borderRadius: 999, padding: "0 6px", fontSize: 9, fontWeight: 900, lineHeight: "16px",
          }}>⭐ +{bonus}</span>
        )}

        {locked && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(60,40,60,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20 }}>🔒</span>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 9px 9px" }}>
        <p title={flower.name} style={{ fontWeight: 700, fontSize: 11, color: "#4D3750", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
          {flower.name}
        </p>
        <span style={{ background: rarity?.bg ?? "#f5eef8", color: rarity?.color ?? "#9a7ab0", borderRadius: 999, padding: "2px 7px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap" }}>
          {flower.rarity}
        </span>
      </div>
    </button>
  )
}
