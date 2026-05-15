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

const ADMIN_WHATSAPP = "5561999743006"

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

// ── Componente do botão de reporte ──
function ReportButton({ flowerName, flowerRarity }: { flowerName: string; flowerRarity: string }) {
  const [open, setOpen]   = useState(false)
  const [nick, setNick]   = useState("")
  const [sent, setSent]   = useState(false)

  function handleSend() {
    if (!nick.trim()) return
    const msg = encodeURIComponent(
      `🌸 *Nova flor para registrar!*\n\n` +
      `👤 Florista: *${nick.trim()}*\n` +
      `🌺 Flor: *${flowerName}*\n` +
      `💎 Raridade: *${flowerRarity}*\n\n` +
      `Por favor atualize minha coleção no Notion! 💕`
    )
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, "_blank")
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setOpen(false)
      setNick("")
    }, 2500)
  }

  return (
    <div style={{ marginTop: 4 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "linear-gradient(135deg, #25D366, #20BA5A)",
            border: "none", borderRadius: 14,
            padding: "11px 16px",
            fontSize: 13, fontWeight: 800, color: "white",
            cursor: "pointer",
            boxShadow: "0 3px 14px rgba(37,211,102,0.25)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          📢 Eu tenho essa flor!
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              background: sent ? "#f0fdf4" : "#f8fffe",
              border: `1.5px solid ${sent ? "#86efac" : "#25D36640"}`,
              borderRadius: 16, padding: 16,
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: 0 }}>✅</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginTop: 6 }}>
                  WhatsApp aberto! Confirme o envio por lá.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#3a2a3a", margin: "0 0 10px" }}>
                  Digite seu nick para avisar a admin:
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    autoFocus
                    type="text"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Seu nick no jogo..."
                    style={{
                      flex: 1,
                      background: "white",
                      border: "1.5px solid #eddde8",
                      borderRadius: 10,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      color: "#3a2a3a",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!nick.trim()}
                    style={{
                      background: nick.trim() ? "linear-gradient(135deg, #25D366, #20BA5A)" : "#e2e8f0",
                      border: "none", borderRadius: 10,
                      padding: "8px 14px",
                      fontSize: 13, fontWeight: 800,
                      color: nick.trim() ? "white" : "#94a3b8",
                      cursor: nick.trim() ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    Enviar
                  </button>
                  <button
                    onClick={() => { setOpen(false); setNick("") }}
                    style={{
                      background: "#f5eef8", border: "none",
                      borderRadius: 10, padding: "8px 10px",
                      fontSize: 12, color: "#b89ab8",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >✕</button>
                </div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "#c4a8c4", margin: "8px 0 0" }}>
                  Será enviado para a admin via WhatsApp com o nome da flor já preenchido 🌸
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
        <div style={{ position: "relative", height: 180, flexShrink: 0, overflow: "hidden" }}>
          {flower.image ? (
            <img src={flower.image} alt={flower.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                <ReportButton flowerName={flower.name} flowerRarity={flower.rarity} />
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
                  <ReportButton flowerName={flower.name} flowerRarity={flower.rarity} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}