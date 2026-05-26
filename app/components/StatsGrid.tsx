"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { Flower, Member } from "@/app/lib/types"
import type { StatModalType, FullPage } from "@/app/components/Dashboard"

interface Props {
  flowers: Flower[]
  members: Member[]
  onStatClick: (type: StatModalType) => void
  onOpenFullPage: (page: NonNullable<FullPage>) => void
}

const cards = [
  {
    label: "Missões",
    description: "Veja quem está competindo e descubra flores ainda em disputa.",
    page: "missoes"   as const,
    icon: "/icons/trofeu.png",
    bg: "/background/fundo-verde.png",
    canto: null,
    accent: "#5A8A6A",
    border: "rgba(212,234,216,0.42)",
    shadow: "rgba(127,184,144,0.12)",
  },
  {
    label: "Coleção",
    description: "Explore sua coleção e acompanhe seu progresso.",
    page: "colecao"   as const,
    icon: "/icons/garden.png",
    bg: null,
    canto: "/ornaments/canto-rosa.png",
    accent: "#B06080",
    border: "rgba(232,184,203,0.42)",
    shadow: "rgba(200,132,158,0.12)",
  },
  {
    label: "Analytics",
    description: "Acompanhe estatísticas e descubra a melhor flor para adquirir.",
    page: "graficos"  as const,
    icon: "/icons/grafics.png",
    bg: "/background/fundo-lilas.png",
    canto: null,
    accent: "#7060A8",
    border: "rgba(205,183,238,0.42)",
    shadow: "rgba(155,127,204,0.12)",
  },
  {
    label: "Floristas",
    description: "Gerencie suas flores da competição e acompanhe outras floristas também.",
    page: "floristas" as const,
    icon: "/icons/team.png",
    bg: null,
    canto: "/ornaments/canto-flor.png",
    accent: "#7060A8",
    border: "rgba(205,183,238,0.42)",
    shadow: "rgba(155,127,204,0.12)",
  },
]

export default function StatsGrid({ onOpenFullPage }: Props) {
  return (
    <>
      <div className="nav-grid">
        {cards.map((c, i) => (
          <motion.button
            key={c.label}
            onClick={() => onOpenFullPage(c.page)}
            className="menu-card"
            style={{
              backgroundColor: "rgba(255,255,255,0.86)",
              border: `1px solid ${c.border}`,
              boxShadow: `0 2px 16px ${c.shadow}`,
              cursor: "pointer", padding: 0,
              minHeight: 180,
              display: "flex", flexDirection: "column",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 28 }}
            whileHover={{ y: -3, boxShadow: `0 18px 48px rgba(220,190,210,0.10), 0 4px 12px ${c.shadow}` }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background image via Next/Image for LCP optimization */}
            {c.bg && (
              <Image
                src={c.bg}
                alt=""
                fill
                sizes="(max-width:767px) 50vw, 25vw"
                style={{ objectFit: "cover", zIndex: 0 }}
                priority={i < 2}
                loading={i < 2 ? "eager" : "lazy"}
              />
            )}
            {c.bg  && <div className="menu-card-glass" style={{ zIndex: 1 }} />}
            {!c.bg && <div style={{ position:"absolute",inset:0,background:"rgba(255,255,255,0.86)" }} />}
            {c.canto && (
              <img
                src={c.canto} alt="" aria-hidden
                className="card-ornament"
                loading="lazy"
                decoding="async"
                style={{ zIndex: 1 }}
              />
            )}

            <div style={{ position:"relative", zIndex:2, padding:"22px 20px 20px", display:"flex", flexDirection:"column", alignItems:"flex-start", flex:1 }}>
              <motion.div
                whileHover={{ y: -2, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="icon-wrapper"
                style={{
                  width: 96, height: 96, borderRadius: 28,
                  background: "rgba(255,255,255,0.42)",
                  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 10px 30px rgba(220,190,220,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18, flexShrink: 0,
                }}
              >
                <Image
                  src={c.icon}
                  alt={c.label}
                  width={72}
                  height={72}
                  style={{ objectFit: "contain", display: "block" }}
                  className="icon-img"
                  priority={i < 2}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </motion.div>

              <p style={{ fontSize: 18, fontWeight: 800, color: "#4D3750", margin: "0 0 7px", letterSpacing: "-0.01em" }}>
                {c.label}
              </p>
              <p className="card-desc" style={{ fontSize: 13, fontWeight: 500, color: "#85667F", lineHeight: 1.65, margin: "0 0 18px", flex: 1 }}>
                {c.description}
              </p>

              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, color:c.accent }}>
                Explorar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <style>{`
        .nav-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:1200px) { .nav-grid{ grid-template-columns:repeat(4,1fr); gap:14px; } }
        @media(max-width:767px) {
          .card-desc { display:none; }
          .nav-grid { gap:10px; }
          .icon-wrapper { width:74px !important; height:74px !important; margin-bottom:12px !important; }
          .icon-img { width:56px !important; height:56px !important; }
        }
        @media(min-width:768px) and (max-width:1199px) {
          .icon-wrapper { width:80px !important; height:80px !important; }
          .icon-img { width:64px !important; height:64px !important; }
        }
      `}</style>
    </>
  )
}