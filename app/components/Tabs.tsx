"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface TabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  // Props extras para a aba Missões (flores em disputa)
  flowers?: Flower[]
  members?: Member[]
  onSelectFlower?: (f: Flower) => void
}

// ── Modal de ranking flores em disputa ──
function DisputaModal({
  flowers, members, flowerCompetitionCount, onClose, onSelectFlower,
}: {
  flowers: Flower[]
  members: Member[]
  flowerCompetitionCount: Record<string, number>
  onClose: () => void
  onSelectFlower: (f: Flower) => void
}) {
  const ranked = Object.entries(flowerCompetitionCount).sort((a, b) => b[1] - a[1])

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
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#d4608a", margin: 0 }}>🏆 Flores em Disputa</h2>
            <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>Apenas quem está <strong>Em Missão</strong></p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 90px)", padding: "14px 16px 32px" }}>
          {ranked.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36 }}>🌿</p>
              <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma flor em disputa</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ranked.map(([name, count], i) => {
                const flower = flowers.find((f) => f.name === name)
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                const users = members.filter((m) => m.status === "Em Missão" && m.favorites.includes(name))
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

// ── Aba de Missões — pills de stats + botão flores em disputa ──
function MissoesTabBar({ flowers = [], members = [], onSelectFlower }: {
  flowers: Flower[]
  members: Member[]
  onSelectFlower?: (f: Flower) => void
}) {
  const [showDisputa, setShowDisputa] = useState(false)

  const flowerCompetitionCount = useMemo(() => {
    const count: Record<string, number> = {}
    members.filter((m) => m.status === "Em Missão").forEach((m) => {
      m.favorites.forEach((name) => { count[name] = (count[name] ?? 0) + 1 })
    })
    return count
  }, [members])

  const emMissaoCount  = members.filter((m) => m.status === "Em Missão").length
  const concluidoCount = members.filter((m) => m.status === "Concluiu").length
  const disputaCount   = Object.keys(flowerCompetitionCount).length

  return (
    <>
      <div style={{
        display: "flex", gap: 8,
        overflowX: "auto", WebkitOverflowScrolling: "touch" as any,
        scrollbarWidth: "none" as any, paddingBottom: 2,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#DCFCE7", border: "1.5px solid #86efac", borderRadius: 999, padding: "7px 14px", flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: "#15803D" }}>{emMissaoCount}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D" }}>Em Missão</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", border: "1.5px solid #bfdbfe", borderRadius: 999, padding: "7px 14px", flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: "#2060C0" }}>{concluidoCount}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#2060C0" }}>Concluíram</span>
        </div>
        <button
          onClick={() => setShowDisputa(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF0F5", border: "1.5px solid #f9c8dc", borderRadius: 999, padding: "7px 14px", flexShrink: 0, cursor: "pointer" }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4608a", display: "inline-block" }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: "#d4608a" }}>{disputaCount}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#d4608a" }}>Flores em disputa</span>
          <span style={{ fontSize: 11, color: "#d4608a" }}>→</span>
        </button>
      </div>

      <AnimatePresence>
        {showDisputa && (
          <DisputaModal
            key="disputa"
            flowers={flowers}
            members={members}
            flowerCompetitionCount={flowerCompetitionCount}
            onClose={() => setShowDisputa(false)}
            onSelectFlower={(f) => { onSelectFlower?.(f); setShowDisputa(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

const coreTabs = [
  { id: "missoes",   label: "🎯 Missões"   },
  { id: "raras",     label: "💎 Mais Raras" },
  { id: "populares", label: "🌻 Populares"  },
]

export default function Tabs({ activeTab, setActiveTab, flowers = [], members = [], onSelectFlower }: TabsProps) {
  return (
    <>
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "#FFF9F2",
        paddingTop: 6, paddingBottom: 6,
        marginLeft: -12, marginRight: -12,
        paddingLeft: 12, paddingRight: 12,
      }}>
        {/* Pills das tabs */}
        <div style={{
          display: "flex", gap: 8,
          overflowX: "auto", WebkitOverflowScrolling: "touch" as any,
          scrollbarWidth: "none" as any,
          marginBottom: activeTab === "missoes" ? 10 : 0,
        }}>
          {coreTabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: "relative", borderRadius: 20,
                  padding: "9px 18px", fontSize: 13, fontWeight: 800,
                  whiteSpace: "nowrap", flexShrink: 0,
                  color: active ? "white" : "#9a7ab0",
                  background: active ? "transparent" : "white",
                  border: active ? "none" : "1px solid #f0dded",
                  boxShadow: active ? "none" : "0 1px 6px rgba(180,100,140,0.06)",
                  cursor: "pointer",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-pill"
                    style={{ position: "absolute", inset: 0, borderRadius: 20, background: "linear-gradient(135deg,#d4608a,#9B4FD4)", boxShadow: "0 4px 18px rgba(212,96,138,0.3)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative" }}>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Barra de missões — só aparece quando Missões está ativo */}
        {activeTab === "missoes" && (
          <MissoesTabBar flowers={flowers} members={members} onSelectFlower={onSelectFlower} />
        )}
      </div>
      <style>{`div::-webkit-scrollbar{display:none;}`}</style>
    </>
  )
}