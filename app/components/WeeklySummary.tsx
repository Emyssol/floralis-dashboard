"use client"

import { useMemo } from "react"
import type { Flower, Member } from "@/app/lib/types"

interface Props { flowers: Flower[]; members: Member[] }

const statConfig = [
  { icon: "/icons/mission.png",  label: "Em Missão",     accent: "#C8849E", tint: "rgba(232,184,203,0.10)", border: "rgba(232,184,203,0.26)" },
  { icon: "/icons/ranking.png",  label: "Em Competição", accent: "#9B7FCC", tint: "rgba(205,183,238,0.10)", border: "rgba(205,183,238,0.26)" },
  { icon: "/icons/flores.png",   label: "Exclusivas",    accent: "#7FB890", tint: "rgba(212,234,216,0.12)", border: "rgba(212,234,216,0.30)" },
]

export default function WeeklySummary({ flowers, members }: Props) {
  const values = useMemo(() => {
    const mission    = members.filter((m) => m.status === "Em Missão")
    const disputa    = new Set(mission.flatMap((m) => m.favorites))
    const exclusivas = flowers.filter((f) => f.owners === 1).length
    return [mission.length, disputa.size, exclusivas]
  }, [flowers, members])

  return (
    /* Sem label "Status da Semana" aqui — já existe acima no Dashboard */
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch" as any,
      scrollbarWidth: "none" as any,
      paddingBottom: 4,
      /* garante que chegue até a borda no mobile */
      marginLeft: -4, paddingLeft: 4,
      marginRight: -4, paddingRight: 4,
    }}>
      {statConfig.map((s, i) => (
        <div key={s.label} style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: `linear-gradient(160deg, rgba(255,255,255,0.88) 0%, ${s.tint} 100%)`,
          border: `1px solid ${s.border}`,
          borderRadius: 999,
          padding: "11px 20px",
          flexShrink: 0,
          boxShadow: "0 2px 10px rgba(160,100,140,0.05)",
          position: "relative", overflow: "hidden",
        }}>
          <img
            src="/ornaments/petals.png" alt="" aria-hidden
            style={{ position:"absolute",right:-6,top:"50%",transform:"translateY(-50%)",height:"130%",width:"auto",opacity:0.05,mixBlendMode:"multiply",pointerEvents:"none",objectFit:"contain" }}
          />
          <img src={s.icon} alt="" width={24} height={24} style={{ objectFit:"contain",flexShrink:0,position:"relative",zIndex:1 }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ fontSize:22,fontWeight:900,color:s.accent,lineHeight:1,letterSpacing:"-0.02em" }}>{values[i]}</div>
            <div style={{ fontSize:10,fontWeight:600,color:"#B8A0B8",marginTop:2,whiteSpace:"nowrap" }}>{s.label}</div>
          </div>
        </div>
      ))}
      <style>{`div::-webkit-scrollbar{display:none;}`}</style>
    </div>
  )
}