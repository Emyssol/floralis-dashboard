"use client"

import { motion } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import { useEffect } from "react"
import type { Member } from "@/app/lib/types"

interface Props {
  member: Member
  onClose: () => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function formatBirthday(iso: string) {
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
  const [, m, d] = iso.split("-").map(Number)
  return `${d} de ${months[m - 1]}`
}

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h >>> 0
}

const avatarGradients = [
  "linear-gradient(135deg, #f4c7d7, #dcccf4)",
  "linear-gradient(135deg, #c7d4f4, #ccf0dc)",
  "linear-gradient(135deg, #f4dcc7, #f4c7dc)",
  "linear-gradient(135deg, #dcc7f4, #c7f4e0)",
]
function avatarGradient(name: string) { return avatarGradients[hashStr(name) % avatarGradients.length] }

const cargoStyle: Record<string, { bg: string; color: string; icon: string }> = {
  Líder:      { bg: "#FEF3C7", color: "#B07010", icon: "👑" },
  "Co-Líder": { bg: "#EDE5FB", color: "#7040B0", icon: "💎" },
  Ancião:     { bg: "#FFE4D4", color: "#C05010", icon: "🔥" },
  Elite:      { bg: "#E0ECFF", color: "#2060C0", icon: "🛡️" },
  Oficial:    { bg: "#FDE8F2", color: "#d4608a", icon: "⚔️" },
  Membro:     { bg: "#F0F5FF", color: "#3060C0", icon: "🌿" },
}

export default function FloristProfileModal({ member, onClose }: Props) {
  const ini   = initials(member.name)
  const cargo = cargoStyle[member.cargo] ?? cargoStyle["Membro"]

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", h)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <ModalPortal>
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,20,45,0.42)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 50,
        isolation: "isolate",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          width: "100%", maxWidth: 480,
          background: "rgba(255,248,251,0.98)",
          borderRadius: "28px 28px 0 0",
          isolation: "isolate",
          overflow: "hidden",
          maxHeight: "90dvh",
          boxShadow: "0 -4px 32px rgba(80,30,60,0.14)",
          display: "flex", flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        {/* Ornamento único */}
        <img src="/ornaments/canto-flor.png" alt="" aria-hidden
          style={{ position:"absolute",top:0,right:0,width:72,height:72,objectFit:"contain",objectPosition:"top right",opacity:0.30,pointerEvents:"none",zIndex:0 }} />

        {/* Handle */}
        <div style={{ display:"flex",justifyContent:"center",paddingTop:10,position:"relative",zIndex:1 }}>
          <div style={{ width:32,height:4,borderRadius:999,background:"rgba(200,160,190,0.28)" }} />
        </div>

        {/* Botão fechar */}
        <button onClick={onClose} style={{
          position:"absolute",right:14,top:14,width:28,height:28,borderRadius:"50%",
          background:"rgba(200,160,190,0.12)",color:"#85667F",
          border:"1px solid rgba(200,160,190,0.22)",
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:700,zIndex:2,
        }}>✕</button>

        {/* Conteúdo */}
        <div style={{ overflowY:"auto",flex:1,padding:"16px 20px 36px",position:"relative",zIndex:1 }}>

          {/* Avatar grande */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20 }}>
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} style={{
                width: 88, height: 88,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.90)",
                boxShadow: "0 6px 24px rgba(160,100,140,0.18)",
                marginBottom: 12,
              }} />
            ) : (
              <div style={{
                width: 88, height: 88,
                borderRadius: "50%",
                background: avatarGradient(member.name),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 900, color: "white",
                boxShadow: "0 6px 24px rgba(160,100,140,0.18)",
                marginBottom: 12,
              }}>{ini}</div>
            )}

            <h2 style={{ fontSize:20,fontWeight:800,color:"#4D3750",margin:"0 0 6px",textAlign:"center" }}>
              {member.name}
            </h2>

            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"center" }}>
              <span style={{ background:cargo.bg,color:cargo.color,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:800,border:`1px solid ${cargo.color}22` }}>
                {cargo.icon} {member.cargo}
              </span>
              <span style={{
                display:"inline-flex",alignItems:"center",gap:4,
                background:"rgba(212,234,216,0.28)",color:"#4a8a5a",
                borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,
                border:"1px solid rgba(212,234,216,0.45)",
              }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:"#5cb87a",display:"inline-block" }} />
                {member.status}
              </span>
            </div>
          </div>

          {/* Aniversário */}
          {member.birthday && (
            <div style={{
              background:"linear-gradient(160deg,rgba(255,255,255,0.88) 0%,rgba(246,230,188,0.12) 100%)",
              border:"1px solid rgba(246,230,188,0.45)",
              borderRadius:14,padding:"11px 14px",
              display:"flex",alignItems:"center",gap:10,
              marginBottom:14,
            }}>
              <span style={{ fontSize:20 }}>🎂</span>
              <div>
                <p style={{ fontSize:10,fontWeight:700,color:"#C8A050",margin:"0 0 1px",textTransform:"uppercase",letterSpacing:"0.07em" }}>Aniversário</p>
                <p style={{ fontSize:14,fontWeight:700,color:"#4D3750",margin:0 }}>{formatBirthday(member.birthday)}</p>
              </div>
            </div>
          )}

          {/* Bio */}
          {member.bio ? (
            <div style={{
              background:"rgba(255,255,255,0.72)",
              border:"1px solid rgba(200,160,190,0.16)",
              borderRadius:14,padding:"13px 16px",
            }}>
              <p style={{ fontSize:10,fontWeight:700,color:"#B8A0B8",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:"0.08em" }}>Sobre</p>
              <p style={{ fontSize:13,fontWeight:500,color:"#85667F",lineHeight:1.6,margin:0 }}>
                {member.bio}
              </p>
            </div>
          ) : (
            <div style={{ textAlign:"center",padding:"12px 0" }}>
              <p style={{ fontSize:13,color:"#B8A0B8",fontStyle:"italic" }}>Sem bio ainda 🌿</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
    </ModalPortal>
  )
}