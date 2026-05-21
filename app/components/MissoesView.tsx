"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]; members: Member[]; search?: string
  onSelectMember: (m: Member) => void; onSelectFlower: (f: Flower) => void
}

const statusCfg: Record<string,{label:string;bg:string;color:string;dot:string}> = {
  "Em Missão": { label:"Em Missão", bg:"rgba(212,234,216,0.30)", color:"#4a8a5a", dot:"#5cb87a" },
  "Concluiu":  { label:"Concluiu",  bg:"rgba(205,183,238,0.20)", color:"#7B60B0", dot:"#9B7FCC" },
  "Pausada":   { label:"Pausada",   bg:"rgba(246,230,188,0.30)", color:"#B08040", dot:"#C8A050" },
  "Fora":      { label:"Fora",      bg:"rgba(200,160,190,0.12)", color:"#85667F", dot:"#B8A0B8" },
}

function initials(n:string){ const p=n.trim().split(/\s+/); return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[1][0]).toUpperCase() }

function DisputaModal({ flowers, members, flowerCompetitionCount, onClose, onSelectFlower }:{
  flowers:Flower[];members:Member[];flowerCompetitionCount:Record<string,number>;onClose:()=>void;onSelectFlower:(f:Flower)=>void
}) {
  const ranked = Object.entries(flowerCompetitionCount).sort((a,b)=>b[1]-a[1])
  return (
    <motion.div style={{ position:"fixed",inset:0,background:"rgba(40,20,45,0.45)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.18}}
      onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <motion.div style={{ width:"100%",maxWidth:520,background:"rgba(255,251,254,0.95)",backdropFilter:"blur(16px)",borderRadius:"24px 24px 0 0",overflow:"hidden",maxHeight:"88vh",boxShadow:"0 -4px 32px rgba(120,60,100,0.15)",border:"1px solid rgba(200,160,190,0.25)" }}
        initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",stiffness:340,damping:34}}>
        <div style={{ display:"flex",justifyContent:"center",paddingTop:10 }}>
          <div style={{ width:32,height:4,borderRadius:999,background:"rgba(200,160,190,0.30)" }} />
        </div>
        <div style={{ padding:"10px 20px 14px",borderBottom:"1px solid rgba(200,160,190,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:17,fontWeight:800,color:"#4D3750",margin:0 }}>🏆 Flores em Disputa</h2>
            <p style={{ fontSize:11,color:"#B8A0B8",margin:"2px 0 0" }}>Quem está <strong>Em Missão</strong></p>
          </div>
          <button onClick={onClose} style={{ width:28,height:28,borderRadius:"50%",background:"rgba(200,160,190,0.12)",color:"#85667F",border:"1px solid rgba(200,160,190,0.22)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto",maxHeight:"calc(88vh - 90px)",padding:"14px 16px 32px" }}>
          {ranked.length===0
            ? <div style={{ padding:"40px 0",textAlign:"center" }}><p style={{ fontSize:36 }}>🌿</p><p style={{ marginTop:10,fontSize:13,color:"#B8A0B8" }}>Nenhuma flor em disputa</p></div>
            : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {ranked.map(([name,count],i)=>{
                  const f=flowers.find(x=>x.name===name); const cfg=f?rarityConfig[f.rarity as keyof typeof rarityConfig]:null
                  const users=members.filter(m=>m.status==="Em Missão"&&m.favorites.includes(name))
                  const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null
                  return (
                    <motion.div key={name} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
                      style={{ background:i<3?(cfg?.bg??"rgba(232,184,203,0.10)"):"rgba(255,255,255,0.70)",border:`1px solid ${i<3?(cfg?.color??"#C8849E")+"22":"rgba(200,160,190,0.20)"}`,borderRadius:14,padding:"10px 12px",cursor:f?"pointer":"default" }}
                      onClick={()=>{f&&onSelectFlower(f);onClose()}}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",flexShrink:0,background:i<3?(cfg?.color??"#C8849E"):"rgba(200,160,190,0.20)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:medal?13:10,fontWeight:900,color:i<3?"white":"#B8A0B8" }}>
                          {medal??`#${i+1}`}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:5,flexWrap:"wrap" }}>
                            <span style={{ fontSize:13,fontWeight:700,color:"#4D3750" }}>{name}</span>
                            {f&&<><span style={{ background:cfg?.bg,color:cfg?.color,borderRadius:999,padding:"1px 6px",fontSize:9,fontWeight:800 }}>{f.rarity.split(" ")[1]}</span><span style={{ fontSize:9,color:"#C8A050" }}>★{f.points}</span></>}
                          </div>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:3,marginTop:4 }}>
                            {users.map(m=><span key={m.id} style={{ background:"rgba(255,255,255,0.7)",border:"1px solid rgba(200,160,190,0.22)",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:600,color:"#85667F" }}>{m.name}</span>)}
                          </div>
                        </div>
                        <div style={{ flexShrink:0,background:i<3?(cfg?.color??"#C8849E"):"rgba(200,160,190,0.20)",borderRadius:10,padding:"4px 8px",minWidth:34,textAlign:"center" }}>
                          <div style={{ fontSize:15,fontWeight:900,color:i<3?"white":"#B8A0B8",lineHeight:1 }}>{count}</div>
                          <div style={{ fontSize:8,fontWeight:700,color:i<3?"rgba(255,255,255,0.75)":"#B8A0B8",textTransform:"uppercase" }}>usando</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
          }
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MissoesView({ flowers, members, search="", onSelectMember, onSelectFlower }: Props) {
  const [filterStatus, setFilterStatus] = useState<string[]>(["Em Missão"])
  const [sortBy, setSortBy] = useState<"status"|"points"|"name">("status")
  const [showDisputa, setShowDisputa] = useState(false)
  const q = search.trim().toLowerCase()

  const flowerCompetitionCount = useMemo(()=>{
    const c:Record<string,number>={}
    members.filter(m=>m.status==="Em Missão").forEach(m=>m.favorites.forEach(n=>{c[n]=(c[n]??0)+1}))
    return c
  },[members])

  const emMissaoCount=members.filter(m=>m.status==="Em Missão").length
  const concluidoCount=members.filter(m=>m.status==="Concluiu").length
  const disputaCount=Object.keys(flowerCompetitionCount).length

  const missoes = useMemo(()=>{
    return members.filter(m=>{
      if(!filterStatus.includes(m.status)) return false
      if(!q) return true
      return m.name.toLowerCase().includes(q)||m.favorites.some(f=>f.toLowerCase().includes(q))
    }).map(member=>{
      const compFlowers=flowers.filter(f=>member.favorites.includes(f.name))
      const totalPoints=compFlowers.reduce((acc,f)=>acc+f.points*(flowerCompetitionCount[f.name]??1),0)
      return {member,compFlowers,totalPoints}
    }).sort((a,b)=>{
      if(sortBy==="status"){ const ord:Record<string,number>={"Em Missão":0,"Concluiu":1}; const d=(ord[a.member.status]??9)-(ord[b.member.status]??9); return d!==0?d:b.totalPoints-a.totalPoints }
      if(sortBy==="points") return b.totalPoints-a.totalPoints
      return a.member.name.localeCompare(b.member.name)
    })
  },[members,flowers,filterStatus,sortBy,q,flowerCompetitionCount])

  const toggle=(s:string)=>setFilterStatus(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])

  return (
    <>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <div>
          <h2 style={{ fontSize:"clamp(17px,4vw,22px)",fontWeight:800,color:"#4D3750",margin:0,letterSpacing:"-0.01em" }}>Missões da Semana</h2>
          <p style={{ fontSize:13,color:"#B8A0B8",marginTop:4 }}>Flores que cada florista está usando na competição</p>
        </div>

        {/* Stats pills */}
        <div style={{ display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none" as any,paddingBottom:2 }}>
          {[
            {v:emMissaoCount, l:"Em Missão",   bg:"rgba(212,234,216,0.30)",color:"#4a8a5a",border:"rgba(212,234,216,0.45)"},
            {v:concluidoCount,l:"Concluíram",  bg:"rgba(205,183,238,0.20)",color:"#7B60B0",border:"rgba(205,183,238,0.35)"},
          ].map(s=>(
            <div key={s.l} style={{ display:"inline-flex",alignItems:"center",gap:7,background:s.bg,border:`1px solid ${s.border}`,borderRadius:999,padding:"7px 16px",flexShrink:0 }}>
              <span style={{ fontSize:15,fontWeight:900,color:s.color }}>{s.v}</span>
              <span style={{ fontSize:12,fontWeight:700,color:s.color }}>{s.l}</span>
            </div>
          ))}
          <button onClick={()=>setShowDisputa(true)} style={{ display:"inline-flex",alignItems:"center",gap:7,background:"rgba(232,184,203,0.18)",border:"1px solid rgba(232,184,203,0.35)",borderRadius:999,padding:"7px 16px",flexShrink:0,cursor:"pointer" }}>
            <span style={{ fontSize:15,fontWeight:900,color:"#C8849E" }}>{disputaCount}</span>
            <span style={{ fontSize:12,fontWeight:700,color:"#C8849E" }}>Flores em disputa →</span>
          </button>
        </div>

        {/* Controles */}
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
            <span style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B8A0B8",flexShrink:0 }}>Mostrar:</span>
            {["Em Missão","Concluiu"].map(s=>{
              const c=statusCfg[s]; const active=filterStatus.includes(s)
              return <button key={s} onClick={()=>toggle(s)} style={{ background:active?c.bg:"rgba(255,255,255,0.70)",color:active?c.color:"#B8A0B8",border:active?`1px solid ${c.dot}44`:"1px solid rgba(200,160,190,0.22)",borderRadius:999,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,transition:"all 0.18s" }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:active?c.dot:"#D0C0D0",display:"inline-block" }} />{s}
              </button>
            })}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
            <span style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B8A0B8",flexShrink:0 }}>Ordenar:</span>
            {[{k:"status",l:"Status"},{k:"points",l:"Pontos"},{k:"name",l:"Nome"}].map(o=>(
              <button key={o.k} onClick={()=>setSortBy(o.k as any)} style={{ background:sortBy===o.k?"rgba(232,184,203,0.20)":"rgba(255,255,255,0.70)",color:sortBy===o.k?"#C8849E":"#B8A0B8",border:sortBy===o.k?"1px solid rgba(200,132,158,0.30)":"1px solid rgba(200,160,190,0.22)",borderRadius:999,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.18s" }}>{o.l}</button>
            ))}
          </div>
        </div>

        {missoes.length===0
          ? <div style={{ padding:"60px 0",textAlign:"center" }}><p style={{ fontSize:44 }}>🌿</p><p style={{ marginTop:12,fontWeight:700,color:"#B8A0B8" }}>Nenhuma florista encontrada</p></div>
          : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {missoes.map(({member,compFlowers,totalPoints},i)=>{
                const cfg=statusCfg[member.status]??statusCfg["Fora"]; const ini=initials(member.name)
                return (
                  <motion.div key={member.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                    style={{ background:"rgba(255,255,255,0.80)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,160,190,0.18)",borderRadius:16,padding:"12px 14px",boxShadow:"0 2px 12px rgba(160,100,140,0.06)" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:compFlowers.length>0?10:0 }}>
                      <button onClick={()=>onSelectMember(member)} style={{ background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0 }}>
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} style={{ width:38,height:38,borderRadius:10,objectFit:"cover" }} />
                          : <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#f5d0e0,#ddc8f4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"white" }}>{ini}</div>
                        }
                      </button>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                          <button onClick={()=>onSelectMember(member)} style={{ background:"none",border:"none",padding:0,cursor:"pointer" }}>
                            <span style={{ fontSize:14,fontWeight:800,color:"#4D3750" }}>{member.name}</span>
                          </button>
                          <span style={{ background:cfg.bg,color:cfg.color,borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,border:`1px solid ${cfg.dot}33` }}>
                            <span style={{ width:5,height:5,borderRadius:"50%",background:cfg.dot,display:"inline-block" }} />{member.status}
                          </span>
                        </div>
                        {totalPoints>0&&<span style={{ fontSize:11,fontWeight:700,color:"#C8A050" }}>★ {totalPoints} pts</span>}
                      </div>
                    </div>
                    {compFlowers.length>0
                      ? <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                          {compFlowers.map(f=>{
                            const rc=rarityConfig[f.rarity as keyof typeof rarityConfig]; const cc=flowerCompetitionCount[f.name]??0; const isM=q&&f.name.toLowerCase().includes(q)
                            return (
                              <button key={f.id} onClick={()=>onSelectFlower(f)} style={{ background:isM?(rc?.color??"#C8849E"):(rc?.bg??"rgba(232,184,203,0.12)"),color:isM?"white":(rc?.color??"#C8849E"),border:`1px solid ${rc?.color??"#C8849E"}${isM?"":"22"}`,borderRadius:999,padding:"3px 9px",fontSize:10,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:3 }}>
                                <span style={{ maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"inline-block" }}>{f.name}</span>
                                <span style={{ fontSize:8,opacity:0.7,flexShrink:0 }}>★{f.points}</span>
                                {cc>1&&<span style={{ background:isM?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.65)",borderRadius:999,padding:"0 4px",fontSize:8,fontWeight:900,color:isM?"white":rc?.color,flexShrink:0 }}>{cc}×</span>}
                              </button>
                            )
                          })}
                        </div>
                      : <p style={{ fontSize:12,color:"#B8A0B8",margin:0 }}>Sem flores para competição cadastradas</p>
                    }
                  </motion.div>
                )
              })}
            </div>
        }
      </div>

      <AnimatePresence>
        {showDisputa&&<DisputaModal key="d" flowers={flowers} members={members} flowerCompetitionCount={flowerCompetitionCount} onClose={()=>setShowDisputa(false)} onSelectFlower={f=>{onSelectFlower(f);setShowDisputa(false)}} />}
      </AnimatePresence>
      <style>{`div::-webkit-scrollbar{display:none;}`}</style>
    </>
  )
}