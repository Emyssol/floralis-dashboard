"use client"

import { motion } from "framer-motion"
import type { Flower, Member } from "@/app/lib/types"
import type { StatModalType, FullPage } from "@/app/components/Dashboard"

interface Props {
  flowers: Flower[]
  members: Member[]
  onStatClick: (type: StatModalType) => void
  onOpenFullPage: (page: NonNullable<FullPage>) => void
}

// SVGs inline — sem PNG, sem container branco
function SvgMission({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#5A8A6A" strokeWidth="2.2" fill="rgba(212,234,216,0.25)" />
      <circle cx="24" cy="24" r="13" stroke="#5A8A6A" strokeWidth="2" fill="rgba(212,234,216,0.20)" />
      <circle cx="24" cy="24" r="6"  stroke="#5A8A6A" strokeWidth="2" fill="rgba(212,234,216,0.35)" />
      <circle cx="24" cy="24" r="2.5" fill="#5A8A6A" />
      <line x1="24" y1="4"  x2="24" y2="10" stroke="#5A8A6A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="24" y1="38" x2="24" y2="44" stroke="#5A8A6A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="4"  y1="24" x2="10" y2="24" stroke="#5A8A6A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="38" y1="24" x2="44" y2="24" stroke="#5A8A6A" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

function SvgCollection({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6C18 6 10 10 10 24s8 18 14 18 14-4 14-18S30 6 24 6z" stroke="#B06080" strokeWidth="2.2" fill="rgba(232,184,203,0.20)" />
      <circle cx="24" cy="18" r="4" stroke="#B06080" strokeWidth="2" fill="rgba(232,184,203,0.30)" />
      <path d="M15 32c0-5 4-8 9-8s9 3 9 8" stroke="#B06080" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M6 14h6M36 14h6M24 6V2" stroke="#B06080" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="14" r="2.5" fill="#B06080" opacity="0.5"/>
      <circle cx="36" cy="14" r="2.5" fill="#B06080" opacity="0.5"/>
      <circle cx="24" cy="4"  r="2.5" fill="#B06080" opacity="0.5"/>
    </svg>
  )
}

function SvgAnalytics({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Donut */}
      <circle cx="24" cy="24" r="16" stroke="#7060A8" strokeWidth="2.2" fill="rgba(205,183,238,0.15)" strokeDasharray="50 51" strokeDashoffset="0"/>
      <circle cx="24" cy="24" r="16" stroke="#C8849E" strokeWidth="2.2" fill="none" strokeDasharray="20 81" strokeDashoffset="-50" />
      <circle cx="24" cy="24" r="16" stroke="#7FB890" strokeWidth="2.2" fill="none" strokeDasharray="14 87" strokeDashoffset="-70" />
      {/* Centro */}
      <circle cx="24" cy="24" r="9" fill="white"/>
      {/* Barra sparkle */}
      <rect x="20" y="20" width="8" height="8" rx="2" fill="rgba(112,96,168,0.20)" />
      {/* Seta up-right */}
      <path d="M20 28l8-8M24 20h4v4" stroke="#7060A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function SvgFlorists({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Avatar principal */}
      <circle cx="18" cy="17" r="7" stroke="#7060A8" strokeWidth="2.2" fill="rgba(205,183,238,0.25)" />
      <path d="M6 38c0-7 5-11 12-11s12 4 12 11" stroke="#7060A8" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Avatar secundário */}
      <circle cx="33" cy="19" r="5" stroke="#C8849E" strokeWidth="1.8" fill="rgba(232,184,203,0.25)" />
      <path d="M25 38c1-5 4-8 8-8s7 3 8 8" stroke="#C8849E" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Florzinha decorativa */}
      <circle cx="38" cy="10" r="3" fill="rgba(232,184,203,0.40)" stroke="#C8849E" strokeWidth="1.5"/>
    </svg>
  )
}

const cards = [
  {
    label: "Missões",
    description: "Veja quem está competindo e descubra flores ainda em disputa.",
    page: "missoes"   as const,
    Svg: SvgMission,
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
    Svg: SvgCollection,
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
    Svg: SvgAnalytics,
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
    Svg: SvgFlorists,
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
        {cards.map((c, i) => {
          const Icon = c.Svg
          return (
            <motion.button
              key={c.label}
              onClick={() => onOpenFullPage(c.page)}
              className="menu-card"
              style={{
                backgroundImage: c.bg ? `url('${c.bg}')` : "none",
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
              {c.bg  && <div className="menu-card-glass" />}
              {!c.bg && <div style={{ position:"absolute",inset:0,background:"rgba(255,255,255,0.86)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)" }} />}
              {c.canto && <img src={c.canto} alt="" aria-hidden className="card-ornament" />}

              <div style={{ position:"relative", zIndex:1, padding:"24px 22px 22px", display:"flex", flexDirection:"column", alignItems:"flex-start", flex:1 }}>

                {/* SVG icon — sem container, direto */}
                <div style={{ marginBottom: 14 }}>
                  <Icon size={44} />
                </div>

                <p style={{ fontSize:18, fontWeight:800, color:"#4D3750", margin:"0 0 7px", letterSpacing:"-0.01em" }}>
                  {c.label}
                </p>
                <p className="card-desc" style={{ fontSize:13, fontWeight:500, color:"#85667F", lineHeight:1.65, margin:"0 0 18px", flex:1 }}>
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
          )
        })}
      </div>

      <style>{`
        .nav-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:1200px) { .nav-grid{ grid-template-columns:repeat(4,1fr); gap:14px; } }
        @media(max-width:767px)  { .card-desc{ display:none; } .nav-grid{ gap:10px; } }
      `}</style>
    </>
  )
}