"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onClose: () => void
  onSelectFlower: (f: Flower) => void
}

export default function DisputaModal({ flowers, members, onClose, onSelectFlower }: Props) {
  const [search, setSearch] = useState("")

  const flowerCompetitionCount: Record<string, number> = {}
  members.filter((m) => m.status === "Em Missão").forEach((m) => {
    m.favorites.forEach((name) => {
      flowerCompetitionCount[name] = (flowerCompetitionCount[name] ?? 0) + 1
    })
  })

  const allRanked = Object.entries(flowerCompetitionCount).sort((a, b) => b[1] - a[1])
  const ranked = search.trim()
    ? allRanked.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : allRanked

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,10,40,0.45)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        zIndex: 50,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: 520,
          background: "white", borderRadius: "28px 28px 0 0",
          overflow: "hidden", maxHeight: "88vh",
          boxShadow: "0 -8px 40px rgba(40,0,40,0.2)",
        }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
        </div>
        <div style={{ padding: "10px 20px 14px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#d4608a", margin: 0 }}>🏆 Flores na Competição</h2>
            <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>Apenas quem está <strong>Em Missão</strong></p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 90px)", padding: "14px 16px 32px" }}>
          {/* Barra de busca */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f4fb", border: "1.5px solid #eddde8", borderRadius: 12, padding: "8px 12px", marginBottom: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔎</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar flor..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#3a2a3a" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#b89ab8" }}>✕</button>}
          </div>

          {ranked.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36 }}>🌿</p>
              <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma flor na competição</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ranked.map(([name, count], i) => {
                const flower = flowers.find((f) => f.name === name)
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                const users = members.filter((m) => m.status === "Em Missão" && m.favorites.includes(name)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    style={{
                      background: i < 3 ? cfg?.bg ?? "#FFF0F5" : "#fafafa",
                      border: `1px solid ${i < 3 ? (cfg?.color ?? "#d4608a") + "33" : "#f0dded"}`,
                      borderRadius: 14, padding: "10px 12px",
                      cursor: flower ? "pointer" : "default",
                    }}
                    onClick={() => { flower && onSelectFlower(flower); onClose() }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        background: i < 3 ? cfg?.color ?? "#d4608a" : "#f0e8ee",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: medal ? 14 : 11, fontWeight: 900,
                        color: i < 3 ? "white" : "#b89ab8",
                      }}>{medal ?? `#${i + 1}`}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#3a2a3a" }}>{name}</span>
                          {flower && (
                            <>
                              <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>{flower.rarity.split(" ")[1]}</span>
                              <span style={{ fontSize: 10, color: "#b07010" }}>⭐{flower.points}</span>
                            </>
                          )}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 5 }}>
                          {users.map((m) => (
                            <span key={m.id} style={{ background: "white", border: "1px solid #f0dded", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 600, color: "#9a7ab0" }}>{m.name}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "center", background: i < 3 ? cfg?.color ?? "#d4608a" : "#f0e8ee", borderRadius: 10, padding: "4px 8px", minWidth: 36 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: i < 3 ? "white" : "#b89ab8", lineHeight: 1 }}>{count}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: i < 3 ? "rgba(255,255,255,0.8)" : "#c4a8c4", textTransform: "uppercase" }}>usando</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}