"use client"

import { motion, AnimatePresence } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"
import { useEffect, useState } from "react"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props { member: Member; flowers: Flower[]; onClose: () => void }

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

const cargoStyle: Record<string, { bg: string; color: string }> = {
  Líder:      { bg: "rgba(246,230,188,0.30)", color: "#B07010" },
  "Co-Líder": { bg: "rgba(205,183,238,0.22)", color: "#7040B0" },
  Ancião:     { bg: "rgba(240,210,190,0.28)", color: "#A04020" },
  Elite:      { bg: "rgba(180,210,240,0.22)", color: "#2060C0" },
  Oficial:    { bg: "rgba(232,184,203,0.22)", color: "#C8849E" },
  Membro:     { bg: "rgba(200,160,190,0.12)", color: "#85667F" },
}

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  "Em Missão": { bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", dot: "#5cb87a" },
  Ativo:       { bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", dot: "#5cb87a" },
  Online:      { bg: "rgba(212,234,216,0.30)", color: "#4a8a5a", dot: "#5cb87a" },
  Offline:     { bg: "rgba(200,160,190,0.12)", color: "#85667F", dot: "#B8A0B8" },
  Inativo:     { bg: "rgba(200,160,190,0.12)", color: "#85667F", dot: "#B8A0B8" },
  Ocupado:     { bg: "rgba(246,230,188,0.28)", color: "#B07010", dot: "#C8A050" },
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

  const [editingFavs, setEditingFavs] = useState(false)
  const [selected, setSelected]       = useState<Set<string>>(new Set(member.favorites))
  const [sent, setSent]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  function toggleFlower(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  async function handleSendFavs() {
    if (selected.size === 0) return
    setLoading(true); setError("")
    try {
      const floresIds = flowers.filter((f) => selected.has(f.name)).map((f) => f.id)
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo:"Competição", florista_id:member.id, florista_nome:member.name, flores_ids:floresIds, flores_nomes:Array.from(selected) }),
      })
      if (!res.ok) throw new Error("Erro ao enviar")
      setSent(true)
      setTimeout(() => { setSent(false); setEditingFavs(false) }, 2500)
    } catch { setError("Erro ao enviar. Tente novamente.") }
    finally { setLoading(false) }
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
    <ModalPortal>
    <motion.div
      style={{ position:"fixed",inset:0,background:"rgba(40,20,45,0.42)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",zIndex:50,isolation:"isolate",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.18 }}
      onClick={(e) => e.target===e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position:"relative", width:"100%", maxWidth:480,
          background:"rgba(255,248,251,0.97)",
          borderRadius:"24px 24px 0 0",
          isolation: "isolate",
          overflow:"hidden", maxHeight:"92vh",
          boxShadow:"0 -4px 32px rgba(80,30,60,0.14), 0 -1px 8px rgba(80,30,60,0.06)",
        }}
        initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
        transition={{ type:"spring", stiffness:340, damping:34 }}
      >
        {/* Ornamento — único: canto-flor no topo direito */}
        <img src="/ornaments/canto-flor.png" alt="" aria-hidden
          style={{ position:"absolute",top:0,right:0,width:80,height:80,objectFit:"contain",objectPosition:"top right",opacity:0.35,pointerEvents:"none",zIndex:0 }} />

        {/* Handle */}
        <div style={{ display:"flex",justifyContent:"center",paddingTop:10,position:"relative",zIndex:1 }}>
          <div style={{ width:32,height:4,borderRadius:999,background:"rgba(200,160,190,0.28)" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"10px 18px 14px",borderBottom:"1px solid rgba(200,160,190,0.16)",position:"relative",zIndex:1 }}>
          <button onClick={onClose} style={{ position:"absolute",right:14,top:14,width:28,height:28,borderRadius:"50%",background:"rgba(200,160,190,0.12)",color:"#85667F",border:"1px solid rgba(200,160,190,0.22)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>✕</button>

          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            {/* Foto ou placeholder */}
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} style={{ width:52,height:52,borderRadius:14,objectFit:"cover",flexShrink:0,boxShadow:"0 3px 12px rgba(160,100,140,0.14)" }} />
            ) : (
              <div style={{ width:52,height:52,borderRadius:14,flexShrink:0,background:"linear-gradient(135deg,#f5d0e0,#ddc8f4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"white",boxShadow:"0 3px 12px rgba(160,100,140,0.14)" }}>{ini}</div>
            )}

            <div style={{ minWidth:0,flex:1,paddingRight:32 }}>
              <h2 style={{ fontSize:17,fontWeight:800,color:"#4D3750",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {member.name}
              </h2>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:5 }}>
                <span style={{ background:cargo.bg,color:cargo.color,borderRadius:999,padding:"2px 9px",fontSize:10,fontWeight:700,border:`1px solid ${cargo.color}22` }}>
                  {member.cargo}
                </span>
                <span style={{ background:status.bg,color:status.color,borderRadius:999,padding:"2px 9px",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,border:`1px solid ${status.dot}33` }}>
                  <span style={{ width:5,height:5,borderRadius:"50%",background:status.dot,display:"inline-block" }} />
                  {member.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable */}
        <div style={{ overflowY:"auto",maxHeight:"calc(92vh - 110px)" }}>

          {/* Stats 4-up */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"14px 16px 4px" }}>
            {[
              { label:"Flores",  value:ownedFlowers.length, accent:"#C8849E", tint:"rgba(232,184,203,0.14)" },
              { label:"URs",     value:urOwned,             accent:"#B06080", tint:"rgba(220,160,180,0.14)" },
              { label:"SSRs",    value:ssrOwned,            accent:"#C8A050", tint:"rgba(246,230,188,0.20)" },
              { label:"Únicas",  value:uniqueOwned,         accent:"#9B7FCC", tint:"rgba(205,183,238,0.16)" },
            ].map((s) => (
              <div key={s.label} style={{ background:s.tint,border:`1px solid ${s.accent}18`,borderRadius:14,padding:"12px 6px",textAlign:"center" }}>
                <div style={{ fontSize:20,fontWeight:900,color:s.accent,lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9,fontWeight:700,color:s.accent,opacity:0.7,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:"12px 16px 32px",display:"flex",flexDirection:"column",gap:16 }}>

            {/* Flores para Competição */}
            <div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <p style={{ fontSize:13,fontWeight:800,color:"#4D3750",margin:0 }}>
                  Flores para Competição
                  <span style={{ fontSize:11,fontWeight:500,color:"#B8A0B8",marginLeft:6 }}>(esta semana)</span>
                </p>
                {!editingFavs && (
                  <button onClick={() => { setEditingFavs(true); setSelected(new Set(member.favorites)) }}
                    style={{ background:"linear-gradient(135deg,#C8849E,#9B7FCC)",border:"none",borderRadius:999,padding:"4px 12px",fontSize:11,fontWeight:700,color:"white",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Atualizar
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!editingFavs ? (
                  <motion.div key="display" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.90) 0%,rgba(205,183,238,0.08) 100%)",border:"1px solid rgba(205,183,238,0.28)",borderRadius:16,padding:"12px 14px",minHeight:48 }}>
                    {member.favorites.length>0 ? (
                      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                        {[...member.favorites]
                          .map(name => ({ name, fd: flowers.find(f=>f.name===name) }))
                          .sort((a,b) => {
                            const ri = rarityOrder.indexOf(a.fd?.rarity ?? "") - rarityOrder.indexOf(b.fd?.rarity ?? "")
                            if (ri !== 0) return ri
                            return a.name.localeCompare(b.name, "pt-BR")
                          })
                          .map(({ name, fd }) => {
                          const cfg = fd ? rarityConfig[fd.rarity as keyof typeof rarityConfig] : null
                          const t = cfg
                            ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }
                            : { background:"rgba(232,184,203,0.20)",color:"#C8849E",border:"1px solid rgba(232,184,203,0.40)" }
                          return (
                            <span key={name} style={{ ...t,borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4 }}>
                              {fd && <span style={{ fontSize:9,opacity:0.8 }}>{fd.rarity.split(" ")[0]}</span>}
                              {name}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize:12,fontWeight:600,color:"#B8A0B8",margin:0,textAlign:"center" }}>Nenhuma flor preferida registrada ainda</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="editing" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                    {sent ? (
                      <div style={{ background:"rgba(212,234,216,0.25)",border:"1px solid rgba(212,234,216,0.55)",borderRadius:16,padding:20,textAlign:"center" }}>
                        <p style={{ fontSize:28,margin:0 }}>✅</p>
                        <p style={{ fontSize:13,fontWeight:700,color:"#4a8a5a",marginTop:8 }}>Solicitação enviada! A admin vai atualizar em breve. 🌸</p>
                      </div>
                    ) : (
                      <div style={{ background:"rgba(255,255,255,0.80)",border:"1px solid rgba(200,160,190,0.20)",borderRadius:16,padding:14 }}>
                        <p style={{ fontSize:12,fontWeight:700,color:"#4D3750",margin:"0 0 10px" }}>Toque nas flores para selecionar as preferidas desta semana:</p>
                        {rarityOrder.map((r) => {
                          const group=ownedFlowers.filter(f=>f.rarity===r).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")); if(!group.length) return null
                          const cfg=rarityConfig[r as keyof typeof rarityConfig]
                          return (
                            <div key={r} style={{ marginBottom:10 }}>
                              <p style={{ fontSize:11,fontWeight:800,color:cfg?.color,margin:"0 0 6px",display:"flex",alignItems:"center",gap:4 }}>
                                {r} <span style={{ fontWeight:600,color:"#B8A0B8" }}>({group.length})</span>
                              </p>
                              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                                {group.map(f=>{
                                  const isSel=selected.has(f.name)
                                  return <button key={f.id} onClick={()=>toggleFlower(f.name)} style={{ background:isSel?(cfg?.color??"#C8849E"):(cfg?.bg??"rgba(232,184,203,0.12)"),color:isSel?"white":(cfg?.color??"#C8849E"),border:`1px solid ${cfg?.color??"#C8849E"}${isSel?"":"30"}`,borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:3 }}>
                                    {isSel&&<span style={{ fontSize:9 }}>✓</span>}{f.name}
                                  </button>
                                })}
                              </div>
                            </div>
                          )
                        })}
                        <div style={{ marginTop:12,padding:"10px 12px",background:"rgba(255,255,255,0.90)",borderRadius:12,border:"1px solid rgba(200,160,190,0.18)" }}>
                          <p style={{ fontSize:11,fontWeight:700,color:"#85667F",margin:"0 0 8px" }}>{selected.size} flor{selected.size!==1?"es":""} selecionada{selected.size!==1?"s":""}{selected.size>0&&":"}</p>
                          {selected.size>0&&<div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>
                            {Array.from(selected).map(name=><span key={name} style={{ background:"rgba(232,184,203,0.18)",color:"#C8849E",border:"1px solid rgba(232,184,203,0.35)",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{name}</span>)}
                          </div>}
                          {error&&<p style={{ fontSize:11,color:"#B06080",marginBottom:8 }}>{error}</p>}
                          <div style={{ display:"flex",gap:8 }}>
                            <button onClick={handleSendFavs} disabled={selected.size===0} style={{ flex:1,background:selected.size>0?"linear-gradient(135deg,#C8849E,#9B7FCC)":"rgba(200,160,190,0.14)",border:"none",borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:700,color:selected.size>0?"white":"#B8A0B8",cursor:selected.size>0?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                              {loading?"Enviando...":"Enviar solicitação"}
                            </button>
                            <button onClick={()=>{ setEditingFavs(false); setSelected(new Set(member.favorites)) }} style={{ background:"rgba(200,160,190,0.10)",border:"1px solid rgba(200,160,190,0.20)",borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:700,color:"#85667F",cursor:"pointer" }}>Cancelar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Flores por raridade */}
            {rarityOrder.map((r) => {
              const group=ownedFlowers.filter(f=>f.rarity===r).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")); if(!group.length) return null
              const cfg=rarityConfig[r as keyof typeof rarityConfig]
              return (
                <div key={r}>
                  <p style={{ fontSize:13,fontWeight:800,color:"#4D3750",margin:"0 0 8px",display:"flex",alignItems:"center",gap:5 }}>
                    <span>{r}</span><span style={{ fontSize:11,fontWeight:600,color:"#B8A0B8" }}>({group.length})</span>
                  </p>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                    {group.map(f=>(
                      <span key={f.id} style={{ background:cfg?.bg,color:cfg?.color,border:`1px solid ${cfg?.color}20`,borderRadius:999,padding:"3px 9px",fontSize:11,fontWeight:600 }}>{f.name}</span>
                    ))}
                  </div>
                </div>
              )
            })}

            {ownedFlowers.length===0&&(
              <div style={{ padding:"28px 0",textAlign:"center" }}>
                <p style={{ fontSize:13,fontWeight:600,color:"#B8A0B8" }}>Sem flores na coleção ainda</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
    </ModalPortal>
  )
}