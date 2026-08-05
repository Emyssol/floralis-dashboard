"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import Divider from "@/app/components/Divider"

interface Props { flowers: Flower[]; members: Member[]; onSelect: (f: Flower) => void }

export default function CompetitionCarousel({ flowers, members, onSelect }: Props) {
  const disputaFlowers = useMemo(() => {
    const countMap: Record<string, number> = {}
    members.filter((m) => m.status === "Em Missão").forEach((m) => {
      m.favorites.forEach((name) => { countMap[name] = (countMap[name] ?? 0) + 1 })
    })
    return Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 14)
      .map(([name, count]) => ({ flower: flowers.find((f) => f.name === name), name, count }))
      .filter((d) => d.flower)
  }, [flowers, members])

  if (disputaFlowers.length === 0) return null

  return (
    <div>
      <Divider src="/ornaments/divisor-folhas.png" opacity={0.55} margin="0 0 0" />

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <p className="section-title">
          <img src="/icons/ranking.png" alt="" width={14} height={14} style={{ objectFit:"contain" }} />
          Ranking das Flores em Competição
        </p>
      </div>

      {/* Scroll horizontal — negativa para ir até a borda da tela no mobile */}
      <div style={{
        display: "flex", gap: 10,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch" as any,
        scrollbarWidth: "none" as any,
        paddingBottom: 6,
        /* estende até a borda no mobile */
        marginLeft: -16, paddingLeft: 16,
        marginRight: -16, paddingRight: 16,
      }}>
        {disputaFlowers.map(({ flower, name, count }, i) => {
          if (!flower) return null
          const cfg   = rarityConfig[flower.rarity as keyof typeof rarityConfig]
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null

          return (
            <motion.button
              key={name}
              onClick={() => onSelect(flower)}
              initial={{ opacity:0, x:10 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay:i*0.03, type:"spring", stiffness:300, damping:28 }}
              whileHover={{ y:-3 }}
              whileTap={{ scale:0.97 }}
              style={{
                flexShrink:0, width:120,
                background:"rgba(255,255,255,0.86)",
                border:"1px solid rgba(200,160,190,0.16)",
                borderRadius:16, overflow:"hidden",
                cursor:"pointer", padding:0, textAlign:"left",
                boxShadow:"0 2px 12px rgba(160,100,140,0.06)",
                transition:"box-shadow 0.22s ease",
              }}
            >
              {/* Imagem */}
              <div style={{ height:96,position:"relative",background:cfg?.bg??"#FFF5F8",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                {flower.image
                  ? <img src={flower.image} alt={name} style={{ width:"100%",height:96,objectFit:"cover",objectPosition:"center 20%" }} />
                  : <span style={{ fontSize:36,opacity:0.45 }}>🌸</span>
                }
                <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 55%,rgba(30,10,30,0.14))" }} />
                <div style={{ position:"absolute",top:6,left:6,background:"rgba(255,255,255,0.88)",backdropFilter:"blur(6px)",borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:800,color:"#85667F",border:"1px solid rgba(200,160,190,0.20)" }}>
                  {medal??`#${i+1}`}
                </div>
                <div style={{ position:"absolute",bottom:6,right:6,background:"rgba(255,255,255,0.88)",backdropFilter:"blur(6px)",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:800,color:cfg?.color??"#C8849E",border:`1px solid ${cfg?.color??"#C8849E"}28` }}>
                  {count}×
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:"8px 10px 10px" }}>
                <p style={{ fontSize:11,fontWeight:700,color:"#4D3750",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.35 }}>{name}</p>
                <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:4 }}>
                  <span style={{ background:cfg?.bg,color:cfg?.color,borderRadius:999,padding:"1px 6px",fontSize:9,fontWeight:800 }}>{flower.rarity.split(" ")[1]}</span>
                  <span style={{ fontSize:9,color:"#C8A050",fontWeight:700 }}>★ {flower.points}</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
      <style>{`div::-webkit-scrollbar{display:none;}`}</style>
    </div>
  )
}