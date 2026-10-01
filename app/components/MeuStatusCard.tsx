"use client"

import { motion } from "framer-motion"
import type { Member } from "@/app/lib/types"

interface Props {
  me: Member | null
  progresso: number              // 0..max
  max: number                    // teto da guilda dela — 24 (Matriz) ou 18 (Baby)
  incrementing?: boolean
  onIncrementMissao: () => void
  onOpenProgressModal: () => void
  onOpenOwned: () => void
  onOpenCompetition: () => void
}

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  "Em Missão": { bg: "rgba(212,234,216,0.35)", color: "#4a8a5a", dot: "#5cb87a" },
  "Concluiu":  { bg: "rgba(205,183,238,0.25)", color: "#7B60B0", dot: "#9B7FCC" },
}

// Card de status pessoal na Home — a ação mais frequente ("atualizar
// competição") fica a 1 clique, sem precisar abrir o próprio perfil primeiro.
// Desktop: info à esquerda, botões compactos lado a lado à direita.
// Mobile: empilhado, botões em largura total (layout original).
export default function MeuStatusCard({ me, progresso, max, incrementing = false, onIncrementMissao, onOpenProgressModal, onOpenOwned, onOpenCompetition }: Props) {
  if (!me) return null

  const done = progresso >= max
  const status = statusStyle[done ? "Concluiu" : "Em Missão"]
  const favNames = me.favorites.slice(0, 2).join(", ")
  const extra = me.favorites.length > 2 ? ` e +${me.favorites.length - 2}` : ""
  const pct = max > 0 ? Math.round((progresso / max) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="meu-status-card"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.90) 0%, rgba(232,184,203,0.10) 100%)",
        border: "1px solid rgba(200,160,190,0.22)",
        borderRadius: 20, padding: "16px 18px",
        marginBottom: 16,
        boxShadow: "0 2px 14px rgba(160,100,140,0.06)",
      }}
    >
      <div className="meu-status-top">
        <div className="meu-status-info">
          <span style={{ fontSize: 13, fontWeight: 800, color: "#4D3750" }}>{progresso}/{max} missões</span>
          <span style={{ background: status.bg, color: status.color, borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
            {done ? "Concluiu" : "Em Missão"}
          </span>
          <button
            onClick={onOpenProgressModal}
            title="Atualizar progresso de missões"
            style={{ background: "rgba(200,160,190,0.12)", border: "1px solid rgba(200,160,190,0.22)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer", flexShrink: 0 }}
          >
            ✏️
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#85667F" }}>
            {me.favorites.length > 0
              ? <>🏆 {me.favorites.length} flor{me.favorites.length > 1 ? "es" : ""} · {favNames}{extra}</>
              : "Nenhuma flor marcada pra competição ainda"}
          </span>
        </div>

        <div className="meu-status-actions">
          <button onClick={onOpenOwned} className="meu-status-btn meu-status-btn--secondary">🌸 Adicionar flores</button>
          <button onClick={onIncrementMissao} disabled={incrementing || done} className="meu-status-btn meu-status-btn--secondary" style={{ opacity: incrementing || done ? 0.6 : 1, cursor: incrementing || done ? "not-allowed" : "pointer" }}>
            {incrementing ? "Salvando..." : "+1 missão"}
          </button>
          <button onClick={onOpenCompetition} className="meu-status-btn meu-status-btn--primary">🏆 Atualizar competição</button>
        </div>
      </div>

      <div style={{ width: "100%", height: 5, borderRadius: 999, background: "rgba(200,160,190,0.16)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg, #d4608a, #9B4FD4)", transition: "width 0.4s ease" }} />
      </div>

      <style>{`
        .meu-status-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .meu-status-top {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .meu-status-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .meu-status-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meu-status-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12px; font-weight: 800;
          cursor: pointer; font-family: inherit;
          white-space: nowrap;
        }
        .meu-status-btn--secondary {
          background: rgba(232,184,203,0.14);
          color: #85667F;
          border: 1px solid rgba(200,160,190,0.22);
        }
        .meu-status-btn--primary {
          background: linear-gradient(135deg, #d4608a, #9B4FD4);
          color: white;
          border: none;
          box-shadow: 0 3px 12px rgba(212,96,138,0.22);
        }

        @media (min-width: 768px) {
          .meu-status-top {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .meu-status-actions {
            flex-direction: row;
            flex-shrink: 0;
          }
          .meu-status-btn {
            width: auto;
            padding: 12px 22px;
          }
        }
      `}</style>
    </motion.div>
  )
}
