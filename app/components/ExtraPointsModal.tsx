"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import SearchBar from "@/app/components/SearchBar"
import InfoTooltip from "@/app/components/InfoTooltip"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  member: Member
  flowers: Flower[]
  pontosExtra?: Record<string, Record<string, number>>
  onPontosExtraChange: (floristaId: string, flowerName: string, pontos: number | null) => void
  onClose: () => void
}

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

// Lista TODAS as flores que a florista possui (não só as da competição desta
// semana) — o bônus é permanente e independente do status de favorita, então
// pode ser pré-marcado numa flor que ela pretende usar depois.
export default function ExtraPointsModal({ member, flowers, pontosExtra = {}, onPontosExtraChange, onClose }: Props) {
  const [search, setSearch] = useState("")
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [error, setError] = useState("")

  const bonusOf = (name: string) => pontosExtra[member.id]?.[name] ?? 0

  const ownedFlowers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return flowers
      .filter((f) => member.flowers.includes(f.name))
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const ri = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
        return ri !== 0 ? ri : a.name.localeCompare(b.name, "pt-BR")
      })
  }, [flowers, member.flowers, search])

  async function handleSet(flowerName: string, pontos: number | null) {
    if (pendingName) return
    setPendingName(flowerName); setError("")
    try {
      const res = await fetch("/api/floristas/pontos-extra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ florista_id: member.id, flower_name: flowerName, pontos }),
      })
      if (!res.ok) throw new Error("Erro")
      onPontosExtraChange(member.id, flowerName, pontos)
    } catch {
      setError("Erro ao salvar. Tente de novo.")
    } finally {
      setPendingName(null)
    }
  }

  return (
    <ModalPortal>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(40,10,40,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          style={{ width: "100%", maxWidth: 560, background: "white", borderRadius: "28px 28px 0 0", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(40,0,40,0.2)" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
          </div>

          <div style={{ padding: "10px 20px 14px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#9F1239", margin: 0 }}>⭐ Atualizar pontos extras</h2>
                <InfoTooltip text="Marque um bônus (+1 a +4) em qualquer flor que você já tem — vale mesmo que não esteja competindo com ela agora, não tem reset semanal." />
              </div>
              <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>Marca quais flores você já upou — vale pra sempre, não reseta na semana</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
          </div>

          <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
            <SearchBar search={search} setSearch={setSearch} placeholder="Buscar flor..." />
            {error && <p style={{ fontSize: 11, color: "#B06080", margin: "8px 0 0" }}>{error}</p>}
          </div>

          <div style={{ overflowY: "auto", padding: "12px 16px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
            {ownedFlowers.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ fontSize: 36 }}>🌿</p>
                <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>
                  {member.flowers.length === 0 ? "Você ainda não marcou nenhuma flor" : "Nenhuma flor encontrada"}
                </p>
              </div>
            ) : (
              ownedFlowers.map((f) => {
                const cfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
                const isFav = member.favorites.includes(f.name)
                const n = bonusOf(f.name)
                const busy = pendingName === f.name
                return (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF9F2", border: "1px solid #f5eef8", borderRadius: 14, padding: "10px 12px", opacity: busy ? 0.6 : 1 }}>
                    {f.image
                      ? <img src={f.image} alt={f.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg?.bg ?? "#FFF0F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🌸</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: 12, color: "#3a2a3a", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                        <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "1px 7px", fontSize: 9, fontWeight: 800 }}>{f.rarity}</span>
                        <span style={{
                          background: isFav ? "rgba(212,234,216,0.45)" : "rgba(200,160,190,0.12)",
                          color: isFav ? "#4a8a5a" : "#85667F",
                          borderRadius: 999, padding: "1px 7px", fontSize: 9, fontWeight: 700,
                        }}>
                          {isFav ? "Na competição" : "Na reserva"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {[1, 2, 3, 4].map((v) => {
                        const active = n === v
                        return (
                          <button
                            key={v}
                            disabled={busy}
                            onClick={() => handleSet(f.name, active ? null : v)}
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              background: active ? "#9F1239" : "rgba(232,184,203,0.16)",
                              color: active ? "white" : "#85667F",
                              border: `1px solid ${active ? "#9F1239" : "rgba(200,160,190,0.28)"}`,
                              fontSize: 11, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            +{v}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
