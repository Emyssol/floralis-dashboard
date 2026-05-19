"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flower: Flower
  members: Member[]
  onClose: () => void
}

type ModalTab = "info" | "floristas"

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

function ownershipLabel(owners: number): { label: string; color: string; bg: string } {
  if (owners === 0) return { label: "Ninguém tem",  color: "#94a3b8", bg: "#f1f5f9" }
  if (owners === 1) return { label: "Exclusiva",    color: "#d4608a", bg: "#FFF0F5" }
  if (owners <= 3)  return { label: "Poucas",       color: "#c0304a", bg: "#fde8ef" }
  if (owners <= 8)  return { label: "Algumas",      color: "#7040b0", bg: "#f0eafb" }
  if (owners <= 14) return { label: "Muitas",       color: "#2060c0", bg: "#eff6ff" }
  return               { label: "Popular",          color: "#15803d", bg: "#dcfce7" }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// ── Botão "Eu tenho essa flor" → API Notion ──
function ReportButton({ flower, members }: { flower: Flower; members: Member[] }) {
  const [open, setOpen]     = useState(false)
  const [selected, setSelected] = useState<Member | null>(null)
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState("")

  async function handleSend() {
    if (!selected) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "Possui Flor",
          florista_id: selected.id,
          florista_nome: selected.name,
          flores_ids: [flower.id],
          flores_nomes: [flower.name],
        }),
      })
      if (!res.ok) throw new Error("Erro ao enviar")
      setSent(true)
      setTimeout(() => { setSent(false); setOpen(false); setSelected(null) }, 2500)
    } catch {
      setError("Erro ao enviar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 4 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "linear-gradient(135deg, #d4608a, #9B4FD4)",
            border: "none", borderRadius: 14,
            padding: "11px 16px",
            fontSize: 13, fontWeight: 800, color: "white",
            cursor: "pointer",
            boxShadow: "0 3px 14px rgba(212,96,138,0.25)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          📢 Eu tenho essa flor!
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              background: sent ? "#f0fdf4" : "#FFF8FF",
              border: `1.5px solid ${sent ? "#86efac" : "#e8d4f8"}`,
              borderRadius: 16, padding: 16,
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: 0 }}>✅</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginTop: 6 }}>
                  Solicitação enviada! A admin vai atualizar em breve. 🌸
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#3a2a3a", margin: "0 0 10px" }}>
                  Selecione seu perfil de florista:
                </p>
                <select
                  value={selected?.id ?? ""}
                  onChange={(e) => {
                    const m = members.find((m) => m.id === e.target.value) ?? null
                    setSelected(m)
                  }}
                  style={{
                    width: "100%",
                    background: "white",
                    border: `1.5px solid ${selected ? "#d4608a" : "#f0dded"}`,
                    borderRadius: 12,
                    padding: "9px 12px",
                    fontSize: 13, fontWeight: 600,
                    color: selected ? "#d4608a" : "#9a7ab0",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23d4608a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: 36,
                  }}
                >
                  <option value="">Escolha sua florista...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {error && <p style={{ fontSize: 11, color: "#c0304a", margin: "8px 0 0" }}>{error}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={handleSend}
                    disabled={!selected || loading}
                    style={{
                      flex: 1,
                      background: selected && !loading ? "linear-gradient(135deg, #d4608a, #9B4FD4)" : "#e2e8f0",
                      border: "none", borderRadius: 10,
                      padding: "9px 14px",
                      fontSize: 13, fontWeight: 800,
                      color: selected && !loading ? "white" : "#94a3b8",
                      cursor: selected && !loading ? "pointer" : "not-allowed",
                    }}
                  >
                    {loading ? "Enviando..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => { setOpen(false); setSelected(null); setError("") }}
                    style={{ background: "#f5eef8", border: "none", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#b89ab8", cursor: "pointer" }}
                  >✕</button>
                </div>
                <p style={{ fontSize: 10, color: "#c4a8c4", margin: "8px 0 0" }}>
                  A solicitação vai direto para o Notion e a admin será notificada 🌸
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ── Modal principal ──
export default function FlowerModal({ flower, members, onClose }: Props) {
  const [tab, setTab]   = useState<ModalTab>("info")
  const rarity          = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const owners          = members.filter((m) => m.flowers.includes(flower.name))
  const favorites       = members.filter((m) => m.favorites.includes(flower.name))
  const ownerLabel      = ownershipLabel(flower.owners)
  const rarityIndex     = rarityOrder.indexOf(flower.rarity)
  const rarityStars     = Math.max(1, 5 - rarityIndex)
  const popularity      = members.length > 0 ? flower.owners / members.length : 0

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,10,40,0.45)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: 500,
          background: "white", borderRadius: 28, overflow: "hidden",
          maxHeight: "90vh",
          boxShadow: "0 24px 64px rgba(40,0,40,0.2), 0 0 0 1px rgba(255,255,255,0.6)",
        }}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Imagem */}
        <div style={{ position: "relative", height: 240, flexShrink: 0, overflow: "hidden" }}>
          {flower.image ? (
            <img src={flower.image} alt={flower.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
          ) : (
            <div style={{
              height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 80, background: `linear-gradient(135deg, ${rarity?.bg ?? "#FFF0F5"}, #F8F0FF)`,
            }}>🌸</div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(10,0,10,0.5))" }} />
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span style={{ background: rarity?.bg, color: rarity?.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>
              {flower.rarity}
            </span>
          </div>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.4)", color: "white",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
              {flower.name}
            </h2>
            <div style={{ marginTop: 4, display: "flex", gap: 2 }}>
              {Array.from({ length: rarityStars }).map((_, i) => <span key={i} style={{ fontSize: 12 }}>⭐</span>)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 2, padding: "10px 16px 0",
          borderBottom: "1px solid #f5eef8",
          background: "white", position: "sticky", top: 0, zIndex: 1,
        }}>
          {(["info", "floristas"] as ModalTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 14px", fontSize: 13, fontWeight: 800,
              color: tab === t ? "#d4608a" : "#c4a8c4",
              borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: tab === t ? "2px solid #d4608a" : "2px solid transparent",
              background: "none", borderRadius: "8px 8px 0 0", cursor: "pointer",
            }}>
              {t === "info" ? "✨ Info" : `👥 Floristas (${owners.length})`}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ overflowY: "auto", maxHeight: "calc(90vh - 240px)" }}>
          <div style={{ padding: 20 }}>

            {tab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { icon: "⭐", value: flower.points, label: "Pontos", color: "#D97706", bg: "#FFFBEB" },
                    { icon: "👥", value: flower.owners, label: "Donos",  color: "#d4608a", bg: "#FFF0F5" },
                    { icon: "🌙", value: flower.origin, label: "Origem", color: "#7040b0", bg: "#F5F0FF" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: s.color, lineHeight: 1.2, wordBreak: "break-word" }}>{s.value}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#c4a8c4", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Raridade de posse */}
                <div style={{ background: ownerLabel.bg, border: `1px solid ${ownerLabel.color}20`, borderRadius: 16, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: ownerLabel.color }}>🌸 Raridade de Posse</span>
                    <span style={{ background: "white", color: ownerLabel.color, border: `1px solid ${ownerLabel.color}30`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 800 }}>
                      {ownerLabel.label}
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.6)", overflow: "hidden", marginBottom: 6 }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 999, background: ownerLabel.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(popularity * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: ownerLabel.color, margin: 0 }}>
                    {flower.owners} de {members.length} membros possuem ({Math.round(popularity * 100)}%)
                  </p>
                </div>

                {/* Quem tem */}
                {owners.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#3a2a3a", marginBottom: 10 }}>✅ Quem tem esta flor</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {owners.map((m) => {
                        const isFav = m.favorites.includes(flower.name)
                        return (
                          <span key={m.id} style={{
                            background: isFav ? "#FFF0F5" : "#F0FDF4",
                            color: isFav ? "#d4608a" : "#15803d",
                            border: `1px solid ${isFav ? "#f9c8dc" : "#86efac"}`,
                            borderRadius: 999, padding: "4px 12px",
                            fontSize: 12, fontWeight: 700,
                            display: "inline-flex", alignItems: "center", gap: 5,
                          }}>
                            {m.avatar
                              ? <img src={m.avatar} alt={m.name} style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />
                              : <span style={{ width: 16, height: 16, borderRadius: "50%", background: isFav ? "#f9c8dc" : "#bbf7d0", fontSize: 8, fontWeight: 900, color: isFav ? "#d4608a" : "#15803d", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{initials(m.name)}</span>
                            }
                            {m.name}
                            {isFav && <span title="Flor favorita">💎</span>}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Favoritas */}
                {favorites.length > 0 && (
                  <div style={{ background: "#FFF8E8", border: "1px solid #FDE68A", borderRadius: 14, padding: "12px 14px" }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#b07010", margin: "0 0 6px" }}>
                      💎 Flor preferida de {favorites.length} florista{favorites.length > 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", margin: 0 }}>
                      {favorites.map((m) => m.name).join(" · ")}
                    </p>
                  </div>
                )}

                {owners.length === 0 && (
                  <div style={{ padding: "16px 0 8px", textAlign: "center" }}>
                    <p style={{ fontSize: 36 }}>🌿</p>
                    <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#c4a8c4" }}>
                      Nenhuma florista possui esta flor ainda
                    </p>
                  </div>
                )}

                {/* ── Botão WhatsApp ── */}
                <ReportButton flower={flower} members={members} />
              </div>
            )}

            {tab === "floristas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {owners.length === 0 ? (
                  <div style={{ padding: "36px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 36 }}>🌿</p>
                    <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#c4a8c4" }}>
                      Nenhuma florista possui esta flor ainda
                    </p>
                  </div>
                ) : owners.map((m) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#FFF9F2", border: "1px solid #f5eef8",
                    borderRadius: 14, padding: "11px 14px",
                  }}>
                    {m.avatar
                      ? <img src={m.avatar} alt={m.name} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FFF0F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌸</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#c4a8c4", margin: 0 }}>{m.cargo}</p>
                    </div>
                    {m.favorites.includes(flower.name) && <span style={{ fontSize: 15 }} title="Flor favorita">💎</span>}
                  </div>
                ))}

                {/* Botão WhatsApp também na aba floristas */}
                <div style={{ marginTop: 8 }}>
                  <ReportButton flower={flower} members={members} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}