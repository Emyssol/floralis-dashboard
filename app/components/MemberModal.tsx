"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  member: Member
  flowers: Flower[]
  onClose: () => void
}

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]


const cargoStyle: Record<string, { bg: string; color: string; icon: string }> = {
  Líder:       { bg: "#FEF3C7", color: "#B07010", icon: "👑" },
  "Co-Líder":  { bg: "#EDE5FB", color: "#7040B0", icon: "💎" },
  Ancião:      { bg: "#FFE4D4", color: "#C05010", icon: "🔥" },
  Elite:       { bg: "#E0ECFF", color: "#2060C0", icon: "🛡️" },
  Oficial:     { bg: "#FDE8F2", color: "#d4608a", icon: "⚔️" },
  Membro:      { bg: "#F0F5FF", color: "#3060C0", icon: "🌿" },
}

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  "Em Missão": { bg: "#DCFCE7", color: "#15803D", dot: "#22c55e" },
  Ativo:       { bg: "#DCFCE7", color: "#15803D", dot: "#22c55e" },
  Online:      { bg: "#DCFCE7", color: "#15803D", dot: "#22c55e" },
  Offline:     { bg: "#F1F5F9", color: "#64748B", dot: "#94a3b8" },
  Inativo:     { bg: "#F1F5F9", color: "#64748B", dot: "#94a3b8" },
  Ocupado:     { bg: "#FEF3C7", color: "#B45309", dot: "#f59e0b" },
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function MemberModal({ member, flowers, onClose }: Props) {
  const ownedFlowers = flowers.filter((f) => member.flowers.includes(f.name))
  const urOwned      = ownedFlowers.filter((f) => f.rarity === "❤️ UR").length
  const ssrOwned     = ownedFlowers.filter((f) => f.rarity === "💛 SSR").length
  const uniqueOwned  = ownedFlowers.filter((f) => f.owners === 1).length

  const cargo  = cargoStyle[member.cargo]   ?? cargoStyle["Membro"]
  const status = statusStyle[member.status] ?? statusStyle["Offline"]
  const ini    = initials(member.name)

  // ── Estado para seleção de preferidas ──
  const [editingFavs, setEditingFavs] = useState(false)
  const [selected, setSelected]       = useState<Set<string>>(new Set(member.favorites))
  const [sent, setSent]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  function toggleFlower(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleSendFavs() {
    if (selected.size === 0) return
    setLoading(true)
    setError("")
    try {
      const floresIds = flowers
        .filter((f) => selected.has(f.name))
        .map((f) => f.id)

      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "Competição",
          florista_id: member.id,
          florista_nome: member.name,
          flores_ids: floresIds,
          flores_nomes: Array.from(selected),
        }),
      })
      if (!res.ok) throw new Error("Erro ao enviar")
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setEditingFavs(false)
      }, 2500)
    } catch {
      setError("Erro ao enviar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

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
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: 460,
          background: "white", borderRadius: 28, overflow: "hidden",
          maxHeight: "92vh",
          boxShadow: "0 24px 64px rgba(40,0,40,0.2), 0 0 0 1px rgba(255,255,255,0.6)",
        }}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "22px 22px 16px", borderBottom: "1px solid #f5eef8" }}>
          <button onClick={onClose} style={{
            position: "absolute", right: 16, top: 16,
            width: 30, height: 30, borderRadius: "50%",
            background: "#f5eef8", color: "#b090c0",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
          }}>✕</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} style={{
                width: 58, height: 58, borderRadius: 18, objectFit: "cover",
                flexShrink: 0, boxShadow: "0 3px 12px rgba(212,96,138,0.18)",
              }} />
            ) : (
              <div style={{
                width: 58, height: 58, borderRadius: 18, flexShrink: 0,
                background: "linear-gradient(135deg, #f9d0e0, #e8d4f8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 900, color: "white",
                boxShadow: "0 3px 12px rgba(212,96,138,0.18)",
              }}>{ini}</div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.name}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
                <span style={{ background: cargo.bg, color: cargo.color, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 800 }}>
                  {cargo.icon} {member.cargo}
                </span>
                <span style={{ background: status.bg, color: status.color, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                  {member.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable ── */}
        <div style={{ overflowY: "auto", maxHeight: "calc(92vh - 130px)" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "16px 18px 4px" }}>
            {[
              { icon: "🌸", value: ownedFlowers.length, label: "FLORES",  color: "#d4608a", bg: "#FFF0F5" },
              { icon: "❤️", value: urOwned,             label: "URS",     color: "#c0304a", bg: "#fde8ef" },
              { icon: "💛", value: ssrOwned,            label: "SSRS",    color: "#b07010", bg: "#fef6e0" },
              { icon: "✨", value: uniqueOwned,         label: "ÚNICAS",  color: "#6040a0", bg: "#f0eafb" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* ── Flores Preferidas ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#3a2a3a", margin: 0 }}>
                  🌿 Flores para Competição
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#c4a8c4", marginLeft: 6 }}>(esta semana)</span>
                </p>
                {/* Botão editar */}
                {!editingFavs && (
                  <button
                    onClick={() => { setEditingFavs(true); setSelected(new Set(member.favorites)) }}
                    style={{
                      background: "linear-gradient(135deg, #d4608a, #9B4FD4)",
                      border: "none", borderRadius: 999,
                      padding: "4px 12px",
                      fontSize: 11, fontWeight: 800, color: "white",
                      cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 5,
                      boxShadow: "0 2px 8px rgba(37,211,102,0.25)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Atualizar
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!editingFavs ? (
                  /* ── Exibição normal ── */
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      background: "linear-gradient(135deg, #FFF5FB, #F8F0FF)",
                      border: "1.5px solid #f0d8ec",
                      borderRadius: 18, padding: "14px 16px",
                      minHeight: 52,
                    }}
                  >
                    {member.favorites.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {member.favorites.map((name, i) => {
                          const fd = flowers.find((f) => f.name === name)
                          const isUR  = fd?.rarity === "❤️ UR"
                          const isSSR = fd?.rarity === "💛 SSR"
                          const isLilac = i % 3 === 2
                          const t = isUR || isSSR
                            ? { background: "#FEF3C7", color: "#B07010", border: "1px solid #FDE68A" }
                            : isLilac
                            ? { background: "#EDE5FB", color: "#7040B0", border: "1px solid #d4bff5" }
                            : { background: "#FFE8F2", color: "#C0306A", border: "1px solid #f9b8d4" }
                          return (
                            <span key={name} style={{ ...t, borderRadius: 999, padding: "4px 11px", fontSize: 11, fontWeight: 700 }}>
                              {name}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#c4a8c4", margin: 0, textAlign: "center" }}>
                        Nenhuma flor preferida registrada ainda
                      </p>
                    )}
                  </motion.div>
                ) : (
                  /* ── Modo edição ── */
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    {sent ? (
                      <div style={{
                        background: "#f0fdf4", border: "1.5px solid #86efac",
                        borderRadius: 18, padding: 20, textAlign: "center",
                      }}>
                        <p style={{ fontSize: 28, margin: 0 }}>✅</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginTop: 8 }}>
                          Solicitação enviada! A admin vai atualizar em breve. 🌸
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        background: "#fafffe",
                        border: "1.5px solid #25D36630",
                        borderRadius: 18, padding: 16,
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#3a2a3a", margin: "0 0 12px" }}>
                          Toque nas flores para selecionar as preferidas desta semana:
                        </p>

                        {/* Flores agrupadas por raridade */}
                        {rarityOrder.map((r) => {
                          const group = ownedFlowers.filter((f) => f.rarity === r)
                          if (!group.length) return null
                          const cfg = rarityConfig[r as keyof typeof rarityConfig]
                          return (
                            <div key={r} style={{ marginBottom: 12 }}>
                              <p style={{ fontSize: 11, fontWeight: 800, color: cfg?.color, margin: "0 0 7px", display: "flex", alignItems: "center", gap: 5 }}>
                                {r} <span style={{ fontWeight: 600, color: "#c4a8c4" }}>({group.length})</span>
                              </p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {group.map((f) => {
                                  const isSelected = selected.has(f.name)
                                  return (
                                    <button
                                      key={f.id}
                                      onClick={() => toggleFlower(f.name)}
                                      style={{
                                        background: isSelected ? cfg?.color ?? "#d4608a" : cfg?.bg ?? "#FFF0F5",
                                        color: isSelected ? "white" : cfg?.color ?? "#d4608a",
                                        border: `1.5px solid ${cfg?.color ?? "#d4608a"}`,
                                        borderRadius: 999,
                                        padding: "3px 10px",
                                        fontSize: 11, fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        display: "inline-flex", alignItems: "center", gap: 4,
                                      }}
                                    >
                                      {isSelected && <span style={{ fontSize: 9 }}>✓</span>}
                                      {f.name}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}

                        {/* Resumo + botões */}
                        <div style={{
                          marginTop: 14,
                          padding: "12px 14px",
                          background: "white",
                          borderRadius: 14,
                          border: "1px solid #f0dded",
                        }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9a7ab0", margin: "0 0 10px" }}>
                            {selected.size} flor{selected.size !== 1 ? "es" : ""} selecionada{selected.size !== 1 ? "s" : ""}
                            {selected.size > 0 && ":"}
                          </p>
                          {selected.size > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                              {Array.from(selected).map((name) => (
                                <span key={name} style={{
                                  background: "#FFF0F5", color: "#d4608a",
                                  border: "1px solid #f9c8dc",
                                  borderRadius: 999, padding: "2px 8px",
                                  fontSize: 10, fontWeight: 700,
                                }}>{name}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={handleSendFavs}
                              disabled={selected.size === 0}
                              style={{
                                flex: 1,
                                background: selected.size > 0
                                  ? "linear-gradient(135deg, #d4608a, #9B4FD4)"
                                  : "#e2e8f0",
                                border: "none", borderRadius: 12,
                                padding: "10px 14px",
                                fontSize: 12, fontWeight: 800,
                                color: selected.size > 0 ? "white" : "#94a3b8",
                                cursor: selected.size > 0 ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                boxShadow: selected.size > 0 ? "0 2px 10px rgba(212,96,138,0.3)" : "none",
                                transition: "all 0.2s",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {loading ? "Enviando..." : "Enviar solicitação"}
                            </button>
                            <button
                              onClick={() => { setEditingFavs(false); setSelected(new Set(member.favorites)) }}
                              style={{
                                background: "#f5eef8", border: "none", borderRadius: 12,
                                padding: "10px 14px", fontSize: 12, fontWeight: 700,
                                color: "#b89ab8", cursor: "pointer",
                              }}
                            >Cancelar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Flores por raridade ── */}
            {rarityOrder.map((r) => {
              const group = ownedFlowers.filter((f) => f.rarity === r)
              if (!group.length) return null
              const cfg = rarityConfig[r as keyof typeof rarityConfig]
              return (
                <div key={r}>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#3a2a3a", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{r}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#c4a8c4" }}>({group.length})</span>
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {group.map((f) => (
                      <span key={f.id} style={{
                        background: cfg?.bg, color: cfg?.color,
                        border: `1px solid ${cfg?.color}22`,
                        borderRadius: 999, padding: "3px 9px",
                        fontSize: 11, fontWeight: 600,
                      }}>{f.name}</span>
                    ))}
                  </div>
                </div>
              )
            })}

            {ownedFlowers.length === 0 && (
              <div style={{ padding: "28px 0", textAlign: "center" }}>
                <p style={{ fontSize: 36 }}>🌿</p>
                <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#c4a8c4" }}>
                  Sem flores na coleção ainda
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}