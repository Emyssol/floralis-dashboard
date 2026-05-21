"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Member } from "@/app/lib/types"
import Divider from "@/app/components/Divider"
import FloristProfileModal from "@/app/components/FloristProfileModal"

interface Props {
  members: Member[]
  onViewAll: () => void
  onSelectMember: (m: Member) => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
function formatBirthday(iso: string) {
  const [, m, d] = iso.split("-"); return `${d}/${m}`
}
function isBirthdayToday(iso: string | null) {
  if (!iso) return false
  const t = new Date(); const [,m,d] = iso.split("-").map(Number)
  return t.getMonth()+1===m && t.getDate()===d
}
function isBirthdaySoon(iso: string | null) {
  if (!iso) return false
  const t = new Date(); const [,m,d] = iso.split("-").map(Number)
  const thisYear = new Date(t.getFullYear(),m-1,d)
  const next = thisYear>=t ? thisYear : new Date(t.getFullYear()+1,m-1,d)
  const diff = (next.getTime()-t.getTime())/(1000*60*60*24)
  return diff>0 && diff<=7
}
function hashStr(s: string) {
  let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0; return h>>>0
}

// Gradientes para o banner quando não há foto (corresponde ao FloristasView)
const bannerGradients = [
  "linear-gradient(135deg, #fff0f5, #f5eeff)",
  "linear-gradient(135deg, #f0f8ff, #e8f0ff)",
  "linear-gradient(135deg, #f0fff4, #e8f5ec)",
  "linear-gradient(135deg, #fffbf0, #fff4e0)",
]
function bannerGradient(name: string) { return bannerGradients[hashStr(name) % bannerGradients.length] }

// Cores para o círculo de iniciais (igual ao FloristasView)
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

const SHOW = 6

export default function FloristasShowcase({ members, onViewAll, onSelectMember }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Member | null>(null)
  const seed = new Date().toDateString()

  const { birthdays, all } = useMemo(() => {
    const birthdays = members.filter((m) => isBirthdayToday(m.birthday))
    const scored = members.map((m) => ({
      m, s: isBirthdayToday(m.birthday) ? -2 : isBirthdaySoon(m.birthday) ? -1 : hashStr(m.id+seed),
    }))
    scored.sort((a,b) => a.s - b.s)
    return { birthdays, all: scored.map(x => x.m) }
  }, [members, seed])

  const shown = expanded ? all : all.slice(0, SHOW)

  return (
    <div>
      <Divider src="/ornaments/divisor-dourado.png" opacity={0.25} margin="0 0 0" />

      {/* Aniversariante do dia */}
      <AnimatePresence>
        {birthdays.map((m) => (
          <motion.button key={m.id} onClick={() => onSelectMember(m)}
            initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{
              width:"100%", textAlign:"left", cursor:"pointer", marginBottom:14,
              background:"linear-gradient(160deg,rgba(255,255,255,0.92) 0%,rgba(246,230,188,0.12) 100%)",
              border:"1px solid rgba(246,230,188,0.50)",
              borderRadius:20, padding:"14px 18px",
              display:"flex", alignItems:"center", gap:14,
              boxShadow:"0 3px 18px rgba(200,160,80,0.08)",
              position:"relative", overflow:"hidden",
            }}>
            <img src="/ornaments/brilho-dourado.png" alt="" aria-hidden style={{ position:"absolute",right:0,top:0,height:"100%",width:"auto",opacity:0.15,objectFit:"contain",objectPosition:"right center",pointerEvents:"none" }} />
            <div style={{ position:"relative", flexShrink:0 }}>
              {m.avatar
                ? <img src={m.avatar} alt={m.name} style={{ width:44,height:44,borderRadius:12,objectFit:"cover",border:"1.5px solid rgba(246,230,188,0.55)" }} />
                : <div style={{ width:44,height:44,borderRadius:12,background:avatarGradient(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"white",border:"1.5px solid rgba(246,230,188,0.55)" }}>{initials(m.name)}</div>
              }
              <span style={{ position:"absolute",bottom:-4,right:-4,fontSize:14 }}>🎂</span>
            </div>
            <div style={{ flex:1,minWidth:0,position:"relative" }}>
              <p style={{ fontSize:10,fontWeight:800,color:"#C8A050",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.08em" }}>Aniversariante de hoje</p>
              <p style={{ fontSize:15,fontWeight:800,color:"#4D3750",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.name}</p>
              <p style={{ fontSize:11,color:"#C8A050",margin:"2px 0 0" }}>Mande seus parabéns 🌸</p>
            </div>
            <span style={{ fontSize:26,flexShrink:0 }}>🥳</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,marginTop:20 }}>
        <p className="section-title">
          <img src="/icons/florist.png" alt="" width={14} height={14} style={{ objectFit:"contain" }} />
          Nossas Floristas
        </p>
        <button onClick={onViewAll} className="btn-ghost" style={{ fontSize:12,padding:"5px 14px" }}>
          Ver todas →
        </button>
      </div>

      {/* Grid — mesmo estilo do FloristasView */}
      <div className="showcase-grid">
        {shown.map((member, i) => {
          const isToday  = isBirthdayToday(member.birthday)
          const isSoon   = !isToday && isBirthdaySoon(member.birthday)
          const ini      = initials(member.name)
          const cargo    = cargoStyle[member.cargo] ?? cargoStyle["Membro"]
          const bio      = member.bio ? member.bio.slice(0,80).trimEnd()+(member.bio.length>80?"...":"") : null
          const bgGrad   = bannerGradient(member.name)
          const avGrad   = avatarGradient(member.name)

          return (
            <motion.button key={member.id} onClick={() => setSelectedProfile(member)}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:Math.min(i,5)*0.05, type:"spring", stiffness:300, damping:28 }}
              whileHover={{ y:-3, boxShadow:"0 8px 28px rgba(180,100,140,0.18)" }}
              whileTap={{ scale:0.98 }}
              style={{
                background:"white",
                border: isToday ? "1.5px solid rgba(246,230,188,0.60)" : "1px solid #f0dded",
                borderRadius:16,
                boxShadow:"0 2px 12px rgba(180,100,140,0.08)",
                overflow:"hidden",
                cursor:"pointer", padding:0, textAlign:"left",
                position:"relative",
              }}>

              {/* Badge aniversário */}
              {(isToday||isSoon) && (
                <div style={{ position:"absolute",top:8,right:8,zIndex:3,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(6px)",border:"1px solid rgba(246,230,188,0.55)",borderRadius:999,padding:"2px 8px",fontSize:9,fontWeight:800,color:"#C8A050" }}>
                  {isToday?"🎉 hoje":"🎂 em breve"}
                </div>
              )}

              {/* Área do avatar — igual ao FloristasView */}
              <div style={{
                height: 90,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: bgGrad,
                overflow: "hidden",
                position: "relative",
              }}>
                {/* SE existir foto: mostrar foto ocupando a área inteira */}
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  />
                ) : (
                  /* SE não existir: círculo de iniciais centralizado */
                  <div style={{
                    width:52, height:52, borderRadius:"50%",
                    background: avGrad,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, fontWeight:900, color:"white",
                    boxShadow:"0 4px 12px rgba(212,96,138,0.20)",
                  }}>{ini}</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding:"9px 11px 11px" }}>
                <p style={{ fontWeight:900,fontSize:12,color:"#3a2a3a",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={member.name}>
                  {member.name}
                </p>

                <span style={{ background:cargo.bg,color:cargo.color,borderRadius:999,padding:"2px 7px",fontSize:10,fontWeight:800,display:"inline-block",marginBottom:5 }}>
                  {cargo.icon} {member.cargo}
                </span>

                {member.birthday && (
                  <p style={{ fontSize:10,fontWeight:600,color:isToday?"#C8A050":"#b89ab8",margin:"0 0 5px",display:"flex",alignItems:"center",gap:3 }}>
                    🎂 {formatBirthday(member.birthday)}
                  </p>
                )}

                {bio ? (
                  <p style={{ fontSize:11,fontWeight:500,color:"#85667F",margin:0,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical" as any,overflow:"hidden" }}>
                    {bio}
                  </p>
                ) : (
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <img src="/icons/bio.png" alt="" width={12} height={12} style={{ objectFit:"contain",opacity:0.4 }} />
                    <p style={{ fontSize:11,color:"#b89ab8",margin:0,fontStyle:"italic" }}>Sem bio ainda</p>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {all.length > SHOW && (
        <div style={{ textAlign:"center",marginTop:16 }}>
          <button onClick={()=>setExpanded(v=>!v)} className="btn-ghost">
            {expanded ? "← Mostrar menos" : `Ver mais ${all.length-SHOW} floristas`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedProfile && (
          <FloristProfileModal
            key="profile-modal"
            member={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .showcase-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        @media(min-width:480px)  { .showcase-grid{ grid-template-columns:repeat(3,1fr); gap:11px; } }
        @media(min-width:768px)  { .showcase-grid{ grid-template-columns:repeat(4,1fr); gap:12px; } }
        @media(min-width:1024px) { .showcase-grid{ grid-template-columns:repeat(5,1fr); gap:13px; } }
        @media(min-width:1280px) { .showcase-grid{ grid-template-columns:repeat(6,1fr); gap:14px; } }
      `}</style>
    </div>
  )
}