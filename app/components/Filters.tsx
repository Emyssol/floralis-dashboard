"use client"

import { useState, useEffect } from "react"
import { rarityConfig } from "@/app/lib/rarity"

interface FiltersProps {
  selectedRarity: string
  setSelectedRarity: (v: string) => void
  selectedOrigin: string
  setSelectedOrigin: (v: string) => void
  origins: string[]
}

const rarities = [
  { label: "Todas", value: "ALL" },
  { label: "UR",    value: "❤️ UR" },
  { label: "SSR",   value: "💛 SSR" },
  { label: "SR",    value: "💜 SR" },
  { label: "R",     value: "💙 R" },
  { label: "N",     value: "💚 N" },
]

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
}

function getOriginIcon(o: string) {
  return originIcon[o] ?? "🌺"
}

function pillStyle(active: boolean, activeColor: string, activeBg: string): React.CSSProperties {
  return active
    ? {
        background: activeBg, color: activeColor,
        border: `1.5px solid ${activeColor}`,
        boxShadow: `0 2px 8px ${activeColor}33`,
        borderRadius: 999, padding: "4px 14px",
        fontSize: 12, fontWeight: 800, cursor: "pointer",
        whiteSpace: "nowrap" as const, transition: "all 0.15s",
        flexShrink: 0,
      }
    : {
        background: "white", color: "#9a7ab0",
        border: "1px solid #f0dded",
        borderRadius: 999, padding: "4px 14px",
        fontSize: 12, fontWeight: 800, cursor: "pointer",
        whiteSpace: "nowrap" as const, transition: "all 0.15s",
        flexShrink: 0,
      }
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const,
  letterSpacing: "0.08em", color: "#b89ab8", flexShrink: 0,
  minWidth: 52,
}

export default function Filters({
  selectedRarity, setSelectedRarity,
  selectedOrigin, setSelectedOrigin,
  origins,
}: FiltersProps) {

  const dropdownBase: React.CSSProperties = {
    background: "white",
    border: "1.5px solid #f0dded",
    borderRadius: 999,
    padding: "5px 32px 5px 12px",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer", outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a7ab0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  }

  const rarityActive = selectedRarity !== "ALL"
  const originActive = selectedOrigin !== "ALL"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

      {/* ── Linha única: RARIDADE label + pills scrolláveis ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={labelStyle}>Raridade</span>
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          WebkitOverflowScrolling: "touch" as any,
          scrollbarWidth: "none" as any,
          flex: 1,
          paddingBottom: 2,
        }}>
          {rarities.map((r) => {
            const active = selectedRarity === r.value
            const cfg = r.value !== "ALL" ? rarityConfig[r.value as keyof typeof rarityConfig] : null
            return (
              <button key={r.value} onClick={() => setSelectedRarity(r.value)}
                style={pillStyle(active, cfg?.color ?? "#d4608a", cfg?.bg ?? "#FFF0F5")}>
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Linha única: ORIGEM label + "Todas" pill + dropdown ── */}
      {origins.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={labelStyle}>Origem</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <button
              onClick={() => setSelectedOrigin("ALL")}
              style={pillStyle(!originActive, "#d4608a", "#FFF0F5")}
            >
              Todas
            </button>
            <select
              value={originActive ? selectedOrigin : ""}
              onChange={(e) => setSelectedOrigin(e.target.value || "ALL")}
              style={{
                ...dropdownBase,
                color: originActive ? "#7040b0" : "#9a7ab0",
                flex: 1,
                minWidth: 0,
                maxWidth: 200,
                ...(originActive ? {
                  borderColor: "#9B4FD4",
                  background: "#F5F0FF",
                  boxShadow: "0 2px 8px #9B4FD433",
                } : {}),
              }}
            >
              <option value="">Filtrar por origem...</option>
              {origins.map((o) => (
                <option key={o} value={o}>{getOriginIcon(o)} {o}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <style>{`.filters-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}