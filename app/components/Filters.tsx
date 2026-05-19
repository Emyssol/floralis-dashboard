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
    ? { background: activeBg, color: activeColor, border: `1.5px solid ${activeColor}`, boxShadow: `0 2px 8px ${activeColor}33`, borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all 0.15s" }
    : { background: "white", color: "#9a7ab0", border: "1px solid #f0dded", borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all 0.15s" }
}

export default function Filters({ selectedRarity, setSelectedRarity, selectedOrigin, setSelectedOrigin, origins }: FiltersProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 800, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "#b89ab8", flexShrink: 0,
  }

  const dropdownStyle: React.CSSProperties = {
    background: "white",
    border: "1.5px solid #f0dded",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: selectedOrigin !== "ALL" ? "#7040b0" : "#9a7ab0",
    cursor: "pointer",
    outline: "none",
    flex: 1,
    maxWidth: 240,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a7ab0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
    ...(selectedOrigin !== "ALL" ? {
      borderColor: "#9B4FD4",
      background: "#F5F0FF",
      boxShadow: "0 2px 8px #9B4FD433",
    } : {}),
  }

  const rarityDropdownStyle: React.CSSProperties = {
    background: "white",
    border: "1.5px solid #f0dded",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: selectedRarity !== "ALL" ? "#d4608a" : "#9a7ab0",
    cursor: "pointer",
    outline: "none",
    flex: 1,
    maxWidth: 160,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a7ab0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
    ...(selectedRarity !== "ALL" ? {
      borderColor: "#d4608a",
      background: "#FFF0F5",
      boxShadow: "0 2px 8px #d4608a33",
    } : {}),
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* ── RARIDADE ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <span style={labelStyle}>Raridade:</span>

        {isMobile ? (
          /* Dropdown em mobile */
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            style={rarityDropdownStyle}
          >
            {rarities.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        ) : (
          /* Botões em desktop */
          rarities.map((r) => {
            const active = selectedRarity === r.value
            const cfg = r.value !== "ALL" ? rarityConfig[r.value as keyof typeof rarityConfig] : null
            return (
              <button key={r.value} onClick={() => setSelectedRarity(r.value)}
                style={pillStyle(active, cfg?.color ?? "#d4608a", cfg?.bg ?? "#FFF0F5")}>
                {r.label}
              </button>
            )
          })
        )}
      </div>

      {/* ── ORIGEM — Todas como pill + dropdown para o resto ── */}
      {origins.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={labelStyle}>Origem:</span>

          {/* Pill "Todas" */}
          <button
            onClick={() => setSelectedOrigin("ALL")}
            style={pillStyle(selectedOrigin === "ALL", "#d4608a", "#FFF0F5")}
          >
            Todas
          </button>

          {/* Dropdown para origens específicas */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedOrigin === "ALL" ? "" : selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value || "ALL")}
              style={{
                ...dropdownStyle,
                flex: "none",
                maxWidth: 220,
                color: selectedOrigin !== "ALL" ? "#7040b0" : "#9a7ab0",
                ...(selectedOrigin !== "ALL" ? {
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
    </div>
  )
}