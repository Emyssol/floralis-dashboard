"use client"

import { motion, AnimatePresence } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flower: Flower
  members: Member[]
  allMembers?: Member[]   // lista completa (ambas as guildas) — usada no seletor "Eu tenho essa flor"
  onClose: () => void
  onFlowerOwned?: (flowerId: string, floristaId: string) => void
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

function ReportButton({ flower, onFlowerOwned }: { flower: Flower; onFlowerOwned?: (flowerId: string, floristaId: string) => void }) {
  const { data: session } = useSession()
  const florista = session?.user

  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [sentMode, setSentMode] = useState<"auto" | "pending">("pending")
  const [error, setError]       = useState("")

  async function handleConfirm() {
    if (!florista?.id) return
    setLoading(true); setError("")
    try {
      // 1ª tentativa: atualizar direto no Notion (sem passar por solicitação)
      const autoRes = await fetch("/api/flores/marcar-posse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flower_id: flower.id,
          florista_id: florista.id,
        }),
      })

      if (autoRes.ok) {
        const data = await autoRes.json().catch(() => null)
        if (data?.alreadyHad === false) {
          onFlowerOwned?.(flower.id, florista.id)
        }
        setSentMode("auto")
        setSent(true)
        setTimeout(() => { setSent(false); setOpen(false) }, 2500)
        return
      }

      // Fallback: atualização automática falhou → cria solicitação Pendente como antes
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "Possui Flor",
          florista_id: florista.id,
          florista_nome: florista.name,
          flores_ids: [flower.id],
          flores_nomes: [flower.name],
        }),
      })
      if (!res.ok) throw new Error("Erro ao enviar")
      setSentMode("pending")
      setSent(true)
      setTimeout(() => { setSent(false); setOpen(false) }, 2500)
    } catch { setError("Erro ao enviar. Tente novamente.") }
    finally { setLoading(false) }
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
            padding: "13px 16px",
            fontSize: 14, fontWeight: 800, color: "white",
            cursor: "pointer",
            boxShadow: "0 3px 14px rgba(212,96,138,0.25)",
          }}
        >
          📢 Eu tenho essa flor!
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
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
                {sentMode === "auto"
                  ? "Flor atualizada! Já está no seu perfil. 🌸"
                  : "Solicitação enviada! A admin vai atualizar em breve. 🌸"}
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#3a2a3a", margin: "0 0 12px" }}>
                Confirmar que <span style={{ color: "#d4608a" }}>{florista?.name ?? "você"}</span> tem esta flor?
              </p>
              {error && <p style={{ fontSize: 11, color: "#c0304a", margin: "0 0 8px" }}>{error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleConfirm} disabled={loading}
                  style={{
                    flex: 1,
                    background: !loading ? "linear-gradient(135deg, #d4608a, #9B4FD4)" : "#e2e8f0",
                    border: "none", borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 800,
                    color: !loading ? "white" : "#94a3b8",
                    cursor: !loading ? "pointer" : "not-allowed",
                  }}
                >{loading ? "Enviando..." : "Confirmar"}</button>
                <button
                  onClick={() => { setOpen(false); setError("") }}
                  style={{ background: "#f5eef8", border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#b89ab8", cursor: "pointer", fontWeight: 700 }}
                >Cancelar</button>
              </div>
              <p style={{ fontSize: 10, color: "#c4a8c4", margin: "8px 0 0" }}>
                A atualização vai direto para o Notion 🌸
              </p>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function FlowerModal({ flower, members, onClose, onFlowerOwned }: Props) {
  const [tab, setTab]           = useState<ModalTab>("info")
  const [isMobile, setIsMobile] = useState(false)
  const rarity     = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const owners     = members.filter((m) => m.flowers.includes(flower.name))
  const favorites  = members.filter((m) => m.favorites.includes(flower.name))
  const ownerLabel = ownershipLabel(flower.owners)
  const rarityIndex = rarityOrder.indexOf(flower.rarity)
  const rarityStars = Math.max(1, 5 - rarityIndex)
  const popularity  = members.length > 0 ? flower.owners / members.length : 0

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const inner = (
    <motion.div
      style={{
        position: "relative", width: "100%", maxWidth: 500,
        background: "white",
        borderRadius: isMobile ? "24px 24px 0 0" : 28,
        maxHeight: isMobile ? "92vh" : "90vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        isolation: "isolate",
        boxShadow: isMobile
          ? "0 -8px 40px rgba(40,0,40,0.2)"
          : "0 24px 64px rgba(40,0,40,0.2), 0 0 0 1px rgba(255,255,255,0.6)",
      }}
      initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.93, y: 20 }}
      animate={isMobile ? { y: 0 }     : { opacity: 1, scale: 1,    y: 0  }}
      exit={isMobile    ? { y: "100%" } : { opacity: 0, scale: 0.93, y: 20 }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
    >
      {/* Handle (mobile only) */}
      {isMobile && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
        </div>
      )}

      {/* Imagem */}
      <div style={{ position: "relative", height: isMobile ? 180 : 240, flexShrink: 0, overflow: "hidden" }}>
        {flower.image ? (
          <img src={flower.image} alt={flower.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        ) : (
          <div style={{
            height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? 64 : 80,
            background: `linear-gradient(135deg, ${rarity?.bg ?? "#FFF0F5"}, #F8F0FF)`,
          }}>🌸</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(10,0,10,0.5))" }} />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ background: rarity?.bg, color: rarity?.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>
            {flower.rarity}
          </span>
        </div>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 12,
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.4)", color: "white",
          cursor: "pointer", fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 50 }}>
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
            {flower.name}
          </h2>
          <div style={{ marginTop: 3, display: "flex", gap: 2 }}>
            {Array.from({ length: rarityStars }).map((_, i) => <span key={i} style={{ fontSize: 11 }}>⭐</span>)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, padding: "0 16px",
        borderBottom: "1px solid #f5eef8",
        background: "white", flexShrink: 0,
      }}>
        {(["info", "floristas"] as ModalTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 14px", fontSize: 13, fontWeight: 800,
            color: tab === t ? "#d4608a" : "#c4a8c4",
            borderTop: "none", borderLeft: "none", borderRight: "none",
            borderBottom: tab === t ? "2px solid #d4608a" : "2px solid transparent",
            background: "none", cursor: "pointer",
          }}>
            {t === "info" ? "✨ Info" : `👥 Floristas (${owners.length})`}
          </button>
        ))}
      </div>

      {/* Conteúdo scrollável */}
      <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" as any }}>
        <div style={{ padding: "16px 16px 32px" }}>

          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Stats — 3 cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { icon: "⭐", value: flower.points, label: "Pontos",   color: "#D97706", bg: "#FFFBEB" },
                  { icon: "👥", value: flower.owners, label: "Quem tem", color: "#C8849E", bg: "#FFF5F8" },
                  { icon: "💎", value: flower.diamonds || flower.points * 3, label: "Dobra nas Missões", color: "#7040A8", bg: "#F8F5FF" },
                ].map((s) => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: s.color, lineHeight: 1.2, wordBreak: "break-word" }}>{s.value}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#c4a8c4", marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Card de origem — horizontal, largura total */}
              <div style={{
                background: "#F8F5FF",
                border: "1px solid rgba(155,127,204,0.30)",
                borderRadius: 12, padding: "8px 12px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: "rgba(155,127,204,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>🌙</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#9B7FCC", lineHeight: 1.2, wordBreak: "break-word" }}>
                    {flower.origin}
                  </span>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#c4a8c4", margin: "2px 0 0", textTransform: "uppercase" }}>
                    Origem
                  </p>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#b89ab8" }}>Popularidade na guilda</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: ownerLabel.color }}>{ownerLabel.label}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "#f0e8ee", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, width: `${Math.round(popularity * 100)}%`, background: rarity?.color ?? "#d4608a", transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontSize: 11, color: "#c4a8c4", marginTop: 4 }}>
                  {flower.owners} de {members.length} floristas ({Math.round(popularity * 100)}%)
                </p>
              </div>

              {owners.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#3a2a3a", marginBottom: 8 }}>✅ Quem tem esta flor</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {owners.map((m) => {
                      const isFav = m.favorites.includes(flower.name)
                      return (
                        <span key={m.id} style={{
                          background: isFav ? "#FFF0F5" : "#F0FDF4",
                          color: isFav ? "#d4608a" : "#15803d",
                          border: `1px solid ${isFav ? "#f9c8dc" : "#86efac"}`,
                          borderRadius: 999, padding: "4px 10px",
                          fontSize: 12, fontWeight: 700,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                          {m.avatar
                            ? <img src={m.avatar} alt={m.name} style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />
                            : <span style={{ width: 16, height: 16, borderRadius: "50%", background: isFav ? "#f9c8dc" : "#bbf7d0", fontSize: 8, fontWeight: 900, color: isFav ? "#d4608a" : "#15803d", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{initials(m.name)}</span>
                          }
                          {m.name}
                          {isFav && <span>💎</span>}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div style={{ background: "#FFF8E8", border: "1px solid #FDE68A", borderRadius: 14, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#b07010", margin: "0 0 4px" }}>
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

              <ReportButton flower={flower} onFlowerOwned={onFlowerOwned} />
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
                  {m.favorites.includes(flower.name) && <span style={{ fontSize: 15 }}>💎</span>}
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <ReportButton flower={flower} onFlowerOwned={onFlowerOwned} />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <ModalPortal>
      <motion.div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(40,10,40,0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 50,
          isolation: "isolate",
          display: "flex",
          alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center",
          padding: isMobile ? 0 : 20,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {inner}
      </motion.div>
    </ModalPortal>
  )
}