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
  onFlowerOwned: (flowerId: string, floristaId: string) => void
  onFlowerUnowned: (flowerId: string, floristaId: string) => void
  onClose: () => void
}

// Marcar/desmarcar posse em lote — mesma rota que o botão "Eu tenho essa
// flor!" do FlowerModal usa (marcar-posse), só que clicando direto no grid
// em vez de abrir flor por flor. Desmarcar também tira a flor da competição
// e zera o bônus dela (cascata feita no backend).
export default function OwnedFlowersModal({ member, flowers, onFlowerOwned, onFlowerUnowned, onClose }: Props) {
  const [search, setSearch] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("ALL")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { toast, showToast } = useToast()

  const owned = useMemo(() => new Set(member.flowers), [member.flowers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    // Ordem natural do catálogo (sem agrupar marcadas primeiro): aqui
    // "marcada" e "com check" são a MESMA coisa, então um sort que junta
    // todas as marcadas no topo faz a primeira tela inteira aparecer
    // "toda marcada" quando a florista já tem muitas flores — visualmente
    // parece bug. Em CompetitionFlowersModal isso não acontece porque lá
    // "selecionada" (favorita) é um subconjunto pequeno de "destravada".
    return flowers.filter((f) => {
      const matchRarity = selectedRarity === "ALL" || f.rarity === selectedRarity
      const matchSearch = !q || f.name.toLowerCase().includes(q)
      return matchRarity && matchSearch
    })
  }, [flowers, search, selectedRarity])

  async function handleToggle(flower: Flower) {
    if (pendingId) return
    const isOwned = owned.has(flower.name)
    setPendingId(flower.id); setError("")
    try {
      const res = await fetch("/api/flores/marcar-posse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flower_id: flower.id,
          florista_id: member.id,
          ...(isOwned ? { remover: true } : {}),
        }),
      })
      if (!res.ok) throw new Error("Erro")
      const data = await res.json().catch(() => null)
      if (isOwned) {
        onFlowerUnowned(flower.id, member.id)
        showToast("Desmarcada", "neutral")
      } else if (data?.alreadyHad === false) {
        onFlowerOwned(flower.id, member.id)
        showToast("✓ Marcada", "success")
      }
    } catch {
      setError("Erro ao salvar. Tente de novo.")
    } finally {
      setPendingId(null)
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
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#d4608a", margin: 0 }}>🌸 Adicionar flores</h2>
                <InfoTooltip text="Marque aqui todas as flores que você já possui. Isso libera a flor pra ser usada na competição." />
              </div>
              <p style={{ fontSize: 11, color: "#c4a8c4", margin: "2px 0 0" }}>{owned.size} de {flowers.length} flores · toque pra marcar ou desmarcar</p>
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
                    selected={owned.has(f.name)}
                    loading={pendingId === f.id}
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
