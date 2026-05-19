"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import type { Flower, Member } from "@/app/lib/types"
import type { StatModalType } from "@/app/components/Dashboard"

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let current = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

interface Props {
  flowers: Flower[]
  members: Member[]
  onStatClick: (type: StatModalType) => void
  onTabChange?: (tab: string) => void
}

export default function StatsGrid({ flowers, members, onStatClick, onTabChange }: Props) {
  const rarasColetadas = flowers.filter((f) =>
    ["❤️ UR", "💛 SSR", "💜 SR"].includes(f.rarity) && f.owners > 0
  ).length
  const emMissaoCount = members.filter((m) => m.status === "Em Missão").length

  const c1 = useCountUp(flowers.length)
  const c2 = useCountUp(members.length)
  const c3 = useCountUp(rarasColetadas)
  const c5 = useCountUp(emMissaoCount)

  const stats: {
    icon: string; value: number | string; label: string
    color: string; type: StatModalType
  }[] = [
    { icon: "🌺", value: c1, label: "TOTAL DE FLORES",  color: "#d4608a", type: "flores"    },
    { icon: "🧑‍🌾", value: c2, label: "FLORISTAS",       color: "#7040b0", type: "floristas" },
    { icon: "💜", value: c3, label: "RARAS COLETADAS",  color: "#7040b0", type: "ssr"       },
    { icon: "🎯", value: c5, label: "EM MISSÃO",        color: "#15803d", type: "missoes"   },
  ]

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {stats.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => {
              if (s.type === "floristas" && onTabChange) {
                onTabChange("floristas")
              } else {
                onStatClick(s.type)
              }
            }}
            style={{
              background: "white",
              border: "1px solid #f0dded",
              borderRadius: 14,
              padding: "14px 8px",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(180,100,140,0.06)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(180,100,140,0.12)" }}
            whileTap={{ scale: 0.97 }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 900, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "clamp(8px, 1.8vw, 10px)", fontWeight: 800, color: s.color, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>
              {s.label}
            </div>
          </motion.button>
        ))}
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </>
  )
}