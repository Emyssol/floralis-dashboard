"use client"

import { motion } from "framer-motion"

interface TabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
}

const tabs = [
  { id: "missoes",   label: "🎯 Missões"    },
  { id: "floristas", label: "🧑‍🌾 Floristas"  },
  { id: "graficos",  label: "📊 Gráficos"   },
  { id: "colecao",   label: "🌸 Coleção"    },
  { id: "raras",     label: "⭐ Mais Raras"  },
  { id: "populares", label: "🌻 Populares"   },
]

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <>
      <div className="tabs-scroll" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, width: "max-content" }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: "relative",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  color: active ? "white" : "#9a7ab0",
                  background: active ? "transparent" : "white",
                  border: active ? "none" : "1px solid #f0dded",
                  boxShadow: active ? "none" : "0 1px 6px rgba(180,100,140,0.06)",
                  cursor: "pointer",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-pill"
                    style={{
                      position: "absolute", inset: 0, borderRadius: 20,
                      background: "linear-gradient(135deg,#d4608a,#9B4FD4)",
                      boxShadow: "0 4px 18px rgba(212,96,138,0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative" }}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .tabs-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .tabs-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}