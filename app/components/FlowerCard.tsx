"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

const originIcon: Record<string,string> = {
  Canteiro:"🌱","Mercado de Flores":"🛒",Astral:"💫","Flor de Nível":"🌿",
  Evento:"🎪",Moonlake:"🌙","Recarga Acumulada":"⚡","Recompensas do Mercado":"🎁",
  "Pacote de Flores":"📦","Decreto Floral":"📜",Desconhecida:"🌺",
}

interface Props {
  flower: Flower; members?: Member[]; totalMembers?: number; onClick?: () => void
}

export default function FlowerCard({ flower, members=[], totalMembers=1, onClick }: Props) {
  const rarity     = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const popularity = totalMembers>0 ? flower.owners/totalMembers : 0
  const icon       = originIcon[flower.origin] ?? "🌺"
  const ownerMembers = members.filter((m) => m.flowers.includes(flower.name))

  return (
    <motion.article
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(200,160,190,0.18)",
        borderRadius: 20,
        boxShadow: "0 2px 14px rgba(160,100,140,0.07), 0 1px 4px rgba(160,100,140,0.04)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "box-shadow 0.22s ease",
      }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(160,100,140,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      {/* Imagem */}
      <div style={{
        height: 110,
        background: `linear-gradient(160deg, ${rarity?.bg ?? "#FFF5F8"}, rgba(255,255,255,0.6))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0, position: "relative",
      }}>
        {flower.image
          ? <img src={flower.image} alt={flower.name} style={{ width:"100%",height:110,objectFit:"cover",objectPosition:"center 30%" }} />
          : <span style={{ fontSize:40,opacity:0.55 }}>🌸</span>
        }
      </div>

      {/* Info */}
      <div style={{ padding:"10px 11px 12px", flex:1 }}>
        <p title={flower.name} style={{ fontWeight:700,fontSize:12,color:"#4D3750",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3 }}>
          {flower.name}
        </p>
        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:6 }}>
          <span style={{ background:rarity?.bg??"#f5eef8",color:rarity?.color??"#9a7ab0",borderRadius:999,padding:"2px 7px",fontSize:10,fontWeight:700,whiteSpace:"nowrap" }}>
            {flower.rarity}
          </span>
          <span style={{ fontSize:10,fontWeight:600,color:"#B8A0B8" }}>{flower.owners} 👑</span>
        </div>
        <div style={{ width:"100%",height:4,borderRadius:999,background:"rgba(200,160,190,0.12)",overflow:"hidden",marginBottom:6 }}>
          <div style={{ height:"100%",borderRadius:999,width:`${Math.round(popularity*100)}%`,background:`linear-gradient(90deg,${rarity?.color??"#C8849E"},${rarity?.color??"#C8849E"}aa)` }} />
        </div>
        <p style={{ fontSize:10,fontWeight:500,color:"#B8A0B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
          {icon} {flower.origin}
        </p>
        {ownerMembers.length>0 && (
          <p style={{ fontSize:10,fontWeight:500,color:"#C8849E",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {ownerMembers.slice(0,2).map(m=>m.name).join(", ")}{ownerMembers.length>2&&` e +${ownerMembers.length-2}`}
          </p>
        )}
      </div>
    </motion.article>
  )
}