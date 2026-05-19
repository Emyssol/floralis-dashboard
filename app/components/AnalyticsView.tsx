"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import type { StatModalType } from "@/app/components/Dashboard"

interface Props {
  flowers: Flower[]
  members: Member[]
  onStatClick: (type: StatModalType) => void
  onSelectFlower?: (f: Flower) => void
}

// ── Donut SVG ──
function DonutChart({ data, label }: {
  data: { label: string; value: number; color: string; bg: string }[]
  label?: string
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  if (total === 0) return <p style={{ color: "#b89ab8", fontSize: 13 }}>Sem dados</p>

  const R = 60, r = 38, cx = 75, cy = 75
  const circumference = 2 * Math.PI * R
  let offset = 0

  const arcs = data.filter((d) => d.value > 0).map((d) => {
    const dash = (d.value / total) * circumference
    const arc = { ...d, dash, gap: circumference - dash, offset }
    offset += dash
    return arc
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f0e8ee" strokeWidth={R - r} />
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none"
              stroke={arc.color} strokeWidth={R - r}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset + circumference * 0.25}
            />
          ))}
          <circle cx={cx} cy={cy} r={r} fill="white" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#3a2a3a", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#b89ab8" }}>{label ?? "flores"}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
        {arcs.map((d) => (
          <div key={d.label} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: d.bg, color: d.color,
            borderRadius: 999, padding: "2px 8px",
            fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, display: "inline-block" }} />
            {d.label}: {d.value}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Barra horizontal ──
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 120, flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#3a2a3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: "#f0e8ee", overflow: "hidden" }}>
        <motion.div style={{ height: "100%", borderRadius: 999, background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }} />
      </div>
      <span style={{ width: 28, flexShrink: 0, textAlign: "right", fontSize: 12, fontWeight: 900, color }}>{value}</span>
    </div>
  )
}

// ── Card ──
function Card({ children, title, delay = 0 }: { children: React.ReactNode; title: string; delay?: number }) {
  return (
    <motion.div
      style={{ background: "white", border: "1px solid #f0dded", borderRadius: 20, boxShadow: "0 2px 12px rgba(180,100,140,0.06)", padding: "20px 20px" }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 900, color: "#3a2a3a", margin: "0 0 16px" }}>{title}</h3>
      {children}
    </motion.div>
  )
}

// ── Flores menos possuídas de uma origem específica ──
function OriginFlowers({ flowers, origin, color, bg, border, onSelectFlower }: {
  flowers: Flower[]
  origin: string
  color: string
  bg: string
  border: string
  onSelectFlower?: (f: Flower) => void
}) {
  const group = flowers
    .filter((f) => f.origin?.includes(origin))
    .sort((a, b) => a.owners - b.owners)
    .slice(0, 10)

  if (group.length === 0) return (
    <p style={{ fontSize: 12, color: "#c4a8c4" }}>Nenhuma flor encontrada</p>
  )

  const maxO = Math.max(...group.map((f) => f.owners), 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {group.map((f) => {
        const cfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
        const pct = f.owners === 0 ? 0 : (f.owners / maxO) * 100
        return (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              background: cfg?.bg, color: cfg?.color,
              borderRadius: 999, padding: "1px 6px",
              fontSize: 9, fontWeight: 800,
              flexShrink: 0, whiteSpace: "nowrap",
            }}>{f.rarity.split(" ")[1]}</span>

            <button
              onClick={() => onSelectFlower?.(f)}
              style={{
                flex: 1, fontSize: 11, fontWeight: 600,
                color: onSelectFlower ? color : "#3a2a3a",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                background: "none", border: "none", padding: 0,
                cursor: onSelectFlower ? "pointer" : "default",
                textAlign: "left",
                textDecoration: onSelectFlower ? "underline" : "none",
                textDecorationStyle: "dotted" as const,
              }}
              title={f.name}
            >{f.name}</button>

            <div style={{ width: 64, height: 5, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", flexShrink: 0 }}>
              <motion.div
                style={{ height: "100%", borderRadius: 999, background: f.owners === 0 ? "#e2e8f0" : color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>

            <span style={{
              fontSize: 11, fontWeight: 900,
              color: f.owners === 0 ? "#94a3b8" : color,
              flexShrink: 0, width: 20, textAlign: "right",
            }}>
              {f.owners === 0 ? "—" : f.owners}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsView({ flowers, members, onStatClick, onSelectFlower }: Props) {
  const coletadas    = flowers.filter((f) => f.owners > 0).length
  const naoColetadas = flowers.filter((f) => f.owners === 0).length

  const raras = flowers.filter((f) => ["❤️ UR", "💛 SSR", "💜 SR"].includes(f.rarity))
  const rarasColetadas = raras.filter((f) => f.owners > 0).length
  const unicasCount = flowers.filter((f) => f.owners === 1).length

  // ── Flores em competição por raridade ──
  const emMissaoMembers = members.filter((m) => m.status === "Em Missão")
  const floresEmComp = new Set(emMissaoMembers.flatMap((m) => m.favorites))
  const compByRarity = [
    { label: "❤️ UR",  value: [...floresEmComp].filter((n) => flowers.find((f) => f.name === n)?.rarity === "❤️ UR").length,  color: "#c0304a", bg: "#fde8ef" },
    { label: "💛 SSR", value: [...floresEmComp].filter((n) => flowers.find((f) => f.name === n)?.rarity === "💛 SSR").length, color: "#b07010", bg: "#fef6e0" },
    { label: "💜 SR",  value: [...floresEmComp].filter((n) => flowers.find((f) => f.name === n)?.rarity === "💜 SR").length,  color: "#7040b0", bg: "#f0eafb" },
    { label: "💙 R",   value: [...floresEmComp].filter((n) => flowers.find((f) => f.name === n)?.rarity === "💙 R").length,   color: "#2060c0", bg: "#eff6ff" },
    { label: "💚 N",   value: [...floresEmComp].filter((n) => flowers.find((f) => f.name === n)?.rarity === "💚 N").length,   color: "#15803d", bg: "#f0fdf4" },
  ].filter((d) => d.value > 0)

  // ── Status das floristas ──
  const statusData = [
    { label: "Em Missão", value: members.filter((m) => m.status === "Em Missão").length, color: "#22c55e", bg: "#DCFCE7" },
    { label: "Concluiu",  value: members.filter((m) => m.status === "Concluiu").length,  color: "#60a5fa", bg: "#EFF6FF" },
    { label: "Pausada",   value: members.filter((m) => m.status === "Pausada").length,   color: "#f59e0b", bg: "#FEF3C7" },
    { label: "Fora",      value: members.filter((m) => m.status === "Fora").length,      color: "#94a3b8", bg: "#F1F5F9" },
  ].filter((d) => d.value > 0)

  const progressItems = [
    { label: "Flores coletadas",   value: coletadas,      total: flowers.length, color: "#34d399" },
    { label: "Flores Raras (SR+)", value: rarasColetadas, total: raras.length,   color: "#a78bfa" },
    { label: "Flores Únicas",      value: unicasCount,    total: flowers.length, color: "#d4608a" },
  ]

  // Flores mais usadas nas competições (quem está Em Missão)
  const flowerMissionCount: Record<string, number> = {}
  emMissaoMembers.forEach((m) => {
    m.favorites.forEach((name) => {
      flowerMissionCount[name] = (flowerMissionCount[name] ?? 0) + 1
    })
  })

  const topByMission = Object.entries(flowerMissionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      flower: flowers.find((f) => f.name === name),
      name,
      count,
    }))

  const visaoGeral: { icon: string; label: string; value: number; color: string; bg: string; modal: StatModalType }[] = [
    { icon: "🌸", label: "Total de flores",        value: flowers.length,                                                       color: "#d4608a", bg: "#FFF0F5", modal: "flores"    },
    { icon: "✨", label: "Flores exclusivas",       value: unicasCount,                                                          color: "#8B5CF6", bg: "#F5F0FF", modal: "unicas"    },
    { icon: "🌿", label: "Ninguém tem",             value: naoColetadas,                                                         color: "#059669", bg: "#F0FDF4", modal: "sem_dono"  },
    { icon: "❤️", label: "UR na guilda",            value: flowers.filter((f) => f.rarity === "❤️ UR" && f.owners > 0).length,  color: "#c0304a", bg: "#fde8ef", modal: "ur"        },
    { icon: "💛", label: "SSR na guilda",           value: flowers.filter((f) => f.rarity === "💛 SSR" && f.owners > 0).length, color: "#b07010", bg: "#fef6e0", modal: "ssr"       },
    { icon: "🔴", label: "Só 1 dona (exclusiva)",  value: flowers.filter((f) => f.owners === 1).length,                        color: "#d4608a", bg: "#FFF0F5", modal: "unicas"    },
    { icon: "🟡", label: "Poucas donas (2-3)",     value: flowers.filter((f) => f.owners >= 2 && f.owners <= 3).length,        color: "#b07010", bg: "#fef6e0", modal: "flores"    },
    { icon: "🟢", label: "Muitas donas (4+)",      value: flowers.filter((f) => f.owners >= 4).length,                         color: "#15803d", bg: "#f0fdf4", modal: "flores"    },
  ]

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 900, color: "#3a2a3a", margin: 0 }}>📊 Analytics da Guilda</h2>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#b89ab8", marginTop: 4 }}>
            Visão estratégica do acervo e atividade dos floristas
          </p>
        </div>

        {/* Donuts estratégicos */}
        <div className="analytics-row">
          <Card title="🎯 Flores em Competição por Raridade" delay={0}>
            <DonutChart data={compByRarity} label={`${floresEmComp.size} flores`} />
          </Card>
          <Card title="🧑‍🌾 Status das Floristas" delay={0.06}>
            <DonutChart data={statusData} label={`${members.length} floristas`} />
          </Card>
        </div>

        {/* Progresso */}
        <Card title="📋 Progresso da Coleção" delay={0.1}>
          <div className="progress-grid">
            {progressItems.map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3a2a3a" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: item.color }}>{item.value}/{item.total}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", marginBottom: 4 }}>
                    <motion.div style={{ height: "100%", borderRadius: 999, background: item.color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#b89ab8", margin: 0 }}>{pct}% completo</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Populares + Visão Geral */}
        <div className="analytics-row">
          <Card title="🎯 Flores Mais Usadas nas Missões" delay={0.14}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {topByMission.length === 0 && (
                <p style={{ fontSize: 13, color: "#c4a8c4" }}>Nenhuma florista Em Missão no momento</p>
              )}
              {topByMission.map(({ flower, name, count }, i) => {
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                const maxCount = topByMission[0]?.count ?? 1
                const pct = (count / maxCount) * 100
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: medal ? 14 : 10, fontWeight: 900, width: 20, flexShrink: 0, textAlign: "center", color: medal ? undefined : "#c4a8c4" }}>
                      {medal ?? `#${i + 1}`}
                    </span>
                    {cfg && (
                      <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                        {flower?.rarity.split(" ")[1]}
                      </span>
                    )}
                    <button
                      onClick={() => flower && onSelectFlower?.(flower)}
                      style={{
                        flex: 1, fontSize: 12, fontWeight: 600, color: flower && onSelectFlower ? "#d4608a" : "#3a2a3a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        background: "none", border: "none", padding: 0,
                        cursor: flower && onSelectFlower ? "pointer" : "default",
                        textAlign: "left",
                        textDecoration: flower && onSelectFlower ? "underline" : "none",
                        textDecorationStyle: "dotted",
                      }}
                      title={name}
                    >{name}</button>
                    {/* Barra */}
                    <div style={{ width: 70, height: 6, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", flexShrink: 0 }}>
                      <motion.div
                        style={{ height: "100%", borderRadius: 999, background: cfg?.color ?? "#d4608a" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    {/* Contador */}
                    <span style={{ fontSize: 12, fontWeight: 900, color: cfg?.color ?? "#d4608a", flexShrink: 0, width: 24, textAlign: "right" }}>
                      {count}×
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="🔎 Visão Geral" delay={0.18}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visaoGeral.map((s) => (
                <button key={s.label} onClick={() => onStatClick(s.modal)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: s.bg, border: `1px solid ${s.color}18`,
                    borderRadius: 12, padding: "10px 12px",
                    cursor: "pointer", width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#3a2a3a" }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</span>
                    <span style={{ fontSize: 10, color: s.color, opacity: 0.6 }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Flores Prioritárias — dois cards lado a lado */}
        <div className="analytics-row">
          <Card title="🌱 Canteiro — Menos Possuídas" delay={0.2}>
            <OriginFlowers flowers={flowers} origin="Canteiro" color="#15803d" bg="#f0fdf4" border="#86efac" onSelectFlower={onSelectFlower} />
          </Card>
          <Card title="🛒 Mercado de Flores — Menos Possuídas" delay={0.24}>
            <OriginFlowers flowers={flowers} origin="Mercado de Flores" color="#7040b0" bg="#f5f0ff" border="#d4bff5" onSelectFlower={onSelectFlower} />
          </Card>
        </div>
      </div>

      <style>{`
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .progress-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .analytics-row {
            grid-template-columns: 1fr 1fr;
          }
          .progress-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </>
  )
}