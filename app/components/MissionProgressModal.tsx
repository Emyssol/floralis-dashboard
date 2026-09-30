"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import InfoTooltip from "@/app/components/InfoTooltip"

interface Props {
  floristaId: string
  progresso: number   // valor atual (0..max)
  max: number         // teto da guilda dela — 24 (Matriz) ou 18 (Baby)
  onProgressoChange: (floristaId: string, progresso: number) => void
  onClose: () => void
}

// Ajuste fino do progresso semanal de missões — contador + slider, com o
// mesmo endpoint/lógica do botão "+1 missão" (aceita `progresso` absoluto).
export default function MissionProgressModal({ floristaId, progresso, max, onProgressoChange, onClose }: Props) {
  const [value, setValue] = useState(progresso)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const clamp = (n: number) => Math.max(0, Math.min(max, n))
  const done = value >= max
  const status = done
    ? { label: "Concluiu", bg: "rgba(205,183,238,0.25)", color: "#7B60B0" }
    : { label: "Em Missão", bg: "rgba(212,234,216,0.35)", color: "#4a8a5a" }

  async function handleSave() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/floristas/concluir-missoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ florista_id: floristaId, progresso: value }),
      })
      if (!res.ok) throw new Error("Erro")
      const data = await res.json().catch(() => null)
      onProgressoChange(floristaId, data?.progresso ?? value)
      onClose()
    } catch {
      setError("Erro ao salvar. Tente de novo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalPortal>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(40,20,45,0.42)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          style={{ position: "relative", width: "100%", maxWidth: 380, background: "rgba(255,248,251,0.98)", borderRadius: 24, padding: "24px 22px", boxShadow: "0 12px 40px rgba(80,30,60,0.20)" }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
        >
          <button
            onClick={onClose}
            style={{ position: "absolute", right: 14, top: 14, width: 28, height: 28, borderRadius: "50%", background: "rgba(200,160,190,0.12)", color: "#85667F", border: "1px solid rgba(200,160,190,0.22)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 24px 16px 0" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#4D3750", margin: 0 }}>
              ✏️ Atualizar progresso de missões
            </h2>
            <InfoTooltip text={`Registre quantas das suas ${max} missões da semana você já concluiu.`} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: "#d4608a", lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#B8A0B8" }}>/{max}</span>
            </div>
            <span style={{ background: status.bg, color: status.color, borderRadius: 999, padding: "3px 12px", fontSize: 11, fontWeight: 800 }}>
              {status.label}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setValue((v) => clamp(v - 1))}
                disabled={value <= 0}
                style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(200,160,190,0.28)", background: "white", fontSize: 18, fontWeight: 900, color: value <= 0 ? "#D8CDD8" : "#85667F", cursor: value <= 0 ? "not-allowed" : "pointer" }}
              >
                −
              </button>
              <input
                type="range"
                min={0} max={max} value={value}
                onChange={(e) => setValue(clamp(Number(e.target.value)))}
                style={{ width: 160, accentColor: "#d4608a" }}
              />
              <button
                onClick={() => setValue((v) => clamp(v + 1))}
                disabled={value >= max}
                style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: value >= max ? "#e8d8e2" : "linear-gradient(135deg,#d4608a,#9B4FD4)", fontSize: 18, fontWeight: 900, color: "white", cursor: value >= max ? "not-allowed" : "pointer" }}
              >
                +
              </button>
            </div>
          </div>

          {error && <p style={{ fontSize: 11, fontWeight: 600, color: "#B06080", margin: "0 0 10px", textAlign: "center" }}>{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1, background: "linear-gradient(135deg,#C8849E,#9B7FCC)", border: "none", borderRadius: 12,
                padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "white",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={onClose}
              style={{ background: "rgba(200,160,190,0.10)", border: "1px solid rgba(200,160,190,0.20)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#85667F", cursor: "pointer" }}
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
