"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import SearchBar from "@/app/components/SearchBar"
import Filters from "@/app/components/Filters"
import MiniFlowerCard from "@/app/components/MiniFlowerCard"
import InfoTooltip from "@/app/components/InfoTooltip"
import Toast from "@/app/components/Toast"
import { useToast } from "@/app/lib/useToast"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  member: Member
  flowers: Flower[]
  pontosExtra?: Record<string, Record<string, number>>
  onFlowerCompetitionChange: (floristaId: string, favorites: string[]) => void
  onClose: () => void
}

// Atualizar as flores da competição desta semana — um clique por flor (sem
// tela de revisão), reaproveitando /api/flores/marcar-competicao (substitui
// a lista inteira a cada chamada). Só flores que a florista já tem podem
// entrar — regra validada aqui no client E no backend.
export default function CompetitionFlowersModal({ member, flowers, pontosExtra = {}, onFlowerCompetitionChange, onClose }: Props) {
  const [search, setSearch] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("ALL")
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { toast, showToast } = useToast()

  const owned = useMemo(() => new Set(member.flowers), [member.flowers])
  const favorites = useMemo(() => new Set(member.favorites), [member.favorites])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = flowers.filter((f) => {
      const matchRarity = selectedRarity === "ALL" || f.rarity === selectedRarity
      const matchSearch = !q || f.name.toLowerCase().includes(q)
      return matchRarity && matchSearch
    })
    // Possuídas (destravadas) primeiro, travadas (🔒) no final — evita rolar
    // no meio das travadas pra achar o que dá pra marcar (sort estável
    // preserva a ordem original dentro de cada grupo).
    return [...list].sort((a, b) => Number(!owned.has(a.name)) - Number(!owned.has(b.name)))
  }, [flowers, search, selectedRarity, owned])

  async function handleToggle(flower: Flower) {
    if (pendingName || !owned.has(flower.name)) return
    const isFav = favorites.has(flower.name)
    const nextFavorites = isFav
      ? member.favorites.filter((n) => n !== flower.name)
      : [...member.favorites, flower.name]
    const floresIds = flowers.filter((f) => nextFavorites.includes(f.name)).map((f) => f.id)

    setPendingName(flower.name); setError("")
    try {
      const res = await fetch("/api/flores/marcar-competicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ florista_id: member.id, flores_ids: floresIds }),
      })
      if (!res.ok) throw new Error("Erro")
      onFlowerCompetitionChange(member.id, nextFavorites)
      showToast(isFav ? "Removida da competição" : "✓ Adicionada à competição", isFav ? "neutral" : "success")
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
          style={{ width: "100%", maxWidth: 860, background: "white", borderRadius: "28px 28px 0 0", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(40,0,40,0.2)" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0d0e0" }} />
          </div>

          <div style={{ padding: "10px 20px 14px", borderBottom: "1px solid #f5eef8", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#9B7FCC", margin: 0 }}>🏆 Atualizar flores da competição</h2>
                <InfoTooltip text="Escolha quais das suas flores estão valendo pontos na disputa desta semana. Só flores que você já marcou como suas podem entrar aqui." />
              </div>
              <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>{favorites.size} selecionada{favorites.size !== 1 ? "s" : ""} · flores sem 🔒 são as que você já tem</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5eef8", color: "#b090c0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
          </div>

          <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            {toast && <div><Toast toast={toast} /></div>}
            <SearchBar search={search} setSearch={setSearch} placeholder="Buscar flor..." />
            <Filters selectedRarity={selectedRarity} setSelectedRarity={setSelectedRarity} selectedOrigin="ALL" setSelectedOrigin={() => {}} origins={[]} />
            {error && <p style={{ fontSize: 11, color: "#B06080", margin: 0 }}>{error}</p>}
          </div>

          <div style={{ overflowY: "auto", padding: "12px 16px 28px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ fontSize: 36 }}>🌿</p>
                <p style={{ marginTop: 10, fontSize: 13, color: "#c4a8c4" }}>Nenhuma flor encontrada</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {filtered.map((f) => (
                  <MiniFlowerCard
                    key={f.id}
                    flower={f}
                    selected={favorites.has(f.name)}
                    locked={!owned.has(f.name)}
                    bonus={pontosExtra[member.id]?.[f.name] ?? 0}
                    loading={pendingName === f.name}
                    onClick={() => handleToggle(f)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
