"use client"

import { useMemo } from "react"
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

// ── Donut SVG — tamanho responsivo ──
function DonutChart({ data, label }: {
  data: { label: string; value: number; color: string; bg: string }[]
  label?: string
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  if (total === 0) return <p style={{ color: "#b89ab8", fontSize: 13 }}>Sem dados</p>

  const R = 52, r = 34, cx = 64, cy = 64
  const circumference = 2 * Math.PI * R
  let offset = 0

  const arcs = data.filter((d) => d.value > 0).map((d) => {
    const dash = (d.value / total) * circumference
    const arc = { ...d, dash, gap: circumference - dash, offset }
    offset += dash
    return arc
  })

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* Donut menor */}
      <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
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
          <span style={{ fontSize: 20, fontWeight: 900, color: "#3a2a3a", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#b89ab8" }}>{label ?? "flores"}</span>
        </div>
      </div>
      {/* Legenda ao lado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
        {arcs.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: d.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.label}: {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Barra horizontal — label relativo ──
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ flex: "0 0 38%", fontSize: 11, fontWeight: 700, color: "#3a2a3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: "#f0e8ee", overflow: "hidden" }}>
        <motion.div style={{ height: "100%", borderRadius: 999, background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }} />
      </div>
      <span style={{ width: 24, flexShrink: 0, textAlign: "right", fontSize: 12, fontWeight: 900, color }}>{value}</span>
    </div>
  )
}

// ── Card ──
function Card({ children, title, delay = 0 }: { children: React.ReactNode; title: string; delay?: number }) {
  return (
    <motion.div
      style={{ background: "white", border: "1px solid #f0dded", borderRadius: 18, boxShadow: "0 2px 12px rgba(180,100,140,0.06)", padding: "16px" }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 style={{ fontSize: 13, fontWeight: 900, color: "#3a2a3a", margin: "0 0 14px" }}>{title}</h3>
      {children}
    </motion.div>
  )
}

// ── Flores menos possuídas de uma origem ──
function OriginFlowers({ flowers, origin, color, onSelectFlower }: {
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
    .slice(0, 8)

  if (group.length === 0) return <p style={{ fontSize: 12, color: "#c4a8c4" }}>Nenhuma flor encontrada</p>

  const maxO = Math.max(...group.map((f) => f.owners), 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {group.map((f) => {
        const cfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
        const pct = f.owners === 0 ? 0 : (f.owners / maxO) * 100
        return (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              background: cfg?.bg, color: cfg?.color,
              borderRadius: 999, padding: "1px 5px",
              fontSize: 9, fontWeight: 800,
              flexShrink: 0,
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
            >{f.name}</button>

            <div style={{ width: 50, height: 5, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", flexShrink: 0 }}>
              <motion.div
                style={{ height: "100%", borderRadius: 999, background: f.owners === 0 ? "#e2e8f0" : color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>

            <span style={{ fontSize: 11, fontWeight: 900, color: f.owners === 0 ? "#94a3b8" : color, flexShrink: 0, width: 18, textAlign: "right" }}>
              {f.owners === 0 ? "—" : f.owners}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsView({ flowers, members, onStatClick, onSelectFlower }: Props) {
  // Lookup O(1) por nome — evita flowers.find() dentro de loops
  const flowerByName = useMemo(() => {
    const map = new Map<string, Flower>()
    for (const f of flowers) map.set(f.name, f)
    return map
  }, [flowers])

  const coletadas    = useMemo(() => flowers.filter((f) => f.owners > 0).length, [flowers])
  const naoColetadas = useMemo(() => flowers.filter((f) => f.owners === 0).length, [flowers])

  const raras = useMemo(() => flowers.filter((f) => ["❤️ UR", "💛 SSR", "💜 SR"].includes(f.rarity)), [flowers])
  const rarasColetadas = useMemo(() => raras.filter((f) => f.owners > 0).length, [raras])
  const unicasCount = useMemo(() => flowers.filter((f) => f.owners === 1).length, [flowers])

  const emMissaoMembers = useMemo(() => members.filter((m) => m.status === "Em Missão"), [members])
  const floresEmComp = useMemo(() => new Set(emMissaoMembers.flatMap((m) => m.favorites)), [emMissaoMembers])

  const compByRarity = useMemo(() => [
    { label: "❤️ UR",  value: [...floresEmComp].filter((n) => flowerByName.get(n)?.rarity === "❤️ UR").length,  color: "#c0304a", bg: "#fde8ef" },
    { label: "💛 SSR", value: [...floresEmComp].filter((n) => flowerByName.get(n)?.rarity === "💛 SSR").length, color: "#b07010", bg: "#fef6e0" },
    { label: "💜 SR",  value: [...floresEmComp].filter((n) => flowerByName.get(n)?.rarity === "💜 SR").length,  color: "#7040b0", bg: "#f0eafb" },
    { label: "💙 R",   value: [...floresEmComp].filter((n) => flowerByName.get(n)?.rarity === "💙 R").length,   color: "#2060c0", bg: "#eff6ff" },
    { label: "💚 N",   value: [...floresEmComp].filter((n) => flowerByName.get(n)?.rarity === "💚 N").length,   color: "#15803d", bg: "#f0fdf4" },
  ].filter((d) => d.value > 0), [floresEmComp, flowerByName])

  const statusData = useMemo(() => [
    { label: "Em Missão", value: members.filter((m) => m.status === "Em Missão").length, color: "#22c55e", bg: "#DCFCE7" },
    { label: "Concluiu",  value: members.filter((m) => m.status === "Concluiu").length,  color: "#60a5fa", bg: "#EFF6FF" },
    { label: "Pausada",   value: members.filter((m) => m.status === "Pausada").length,   color: "#f59e0b", bg: "#FEF3C7" },
    { label: "Fora",      value: members.filter((m) => m.status === "Fora").length,      color: "#94a3b8", bg: "#F1F5F9" },
  ].filter((d) => d.value > 0), [members])

  const progressItems = useMemo(() => [
    { label: "Flores coletadas",   value: coletadas,      total: flowers.length, color: "#34d399" },
    { label: "Flores Raras (SR+)", value: rarasColetadas, total: raras.length,   color: "#a78bfa" },
    { label: "Flores Únicas",      value: unicasCount,    total: flowers.length, color: "#d4608a" },
  ], [coletadas, rarasColetadas, unicasCount, raras, flowers])

  const flowerMissionCount = useMemo(() => {
    const counts: Record<string, number> = {}
    emMissaoMembers.forEach((m) => {
      m.favorites.forEach((name) => {
        counts[name] = (counts[name] ?? 0) + 1
      })
    })
    return counts
  }, [emMissaoMembers])

  const topByMission = useMemo(() =>
    Object.entries(flowerMissionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ flower: flowerByName.get(name), name, count })),
    [flowerMissionCount, flowerByName]
  )

  const visaoGeral = useMemo((): { icon: string; label: string; value: number; color: string; bg: string; modal: StatModalType }[] => [
    { icon: "🌸", label: "Total de flores",        value: flowers.length,                                                       color: "#d4608a", bg: "#FFF0F5", modal: "flores"    },
    { icon: "✨", label: "Flores exclusivas",       value: unicasCount,                                                          color: "#8B5CF6", bg: "#F5F0FF", modal: "unicas"    },
    { icon: "🌿", label: "Ninguém tem",             value: naoColetadas,                                                         color: "#059669", bg: "#F0FDF4", modal: "sem_dono"  },
    { icon: "❤️", label: "UR na guilda",            value: flowers.filter((f) => f.rarity === "❤️ UR" && f.owners > 0).length,  color: "#c0304a", bg: "#fde8ef", modal: "ur"        },
    { icon: "💛", label: "SSR na guilda",           value: flowers.filter((f) => f.rarity === "💛 SSR" && f.owners > 0).length, color: "#b07010", bg: "#fef6e0", modal: "ssr"       },
    { icon: "🔴", label: "Só 1 dona",              value: flowers.filter((f) => f.owners === 1).length,                        color: "#d4608a", bg: "#FFF0F5", modal: "unicas"    },
    { icon: "🟡", label: "Poucas donas (2-3)",     value: flowers.filter((f) => f.owners >= 2 && f.owners <= 3).length,        color: "#b07010", bg: "#fef6e0", modal: "flores"    },
    { icon: "🟢", label: "Muitas donas (4+)",      value: flowers.filter((f) => f.owners >= 4).length,                         color: "#15803d", bg: "#f0fdf4", modal: "flores"    },
  ], [flowers, unicasCount, naoColetadas])

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div>
          <h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, color: "#3a2a3a", margin: 0 }}>📊 Analytics da Guilda</h2>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#b89ab8", marginTop: 4 }}>
            Visão estratégica do acervo e atividade dos floristas
          </p>
        </div>

        {/* Donuts — empilhados no mobile, lado a lado no desktop */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {progressItems.map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3a2a3a" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: item.color }}>{item.value}/{item.total} — {pct}%</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "#f0e8ee", overflow: "hidden" }}>
                    <motion.div style={{ height: "100%", borderRadius: 999, background: item.color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top missões + Visão Geral */}
        <div className="analytics-row">
          <Card title="🎯 Flores Mais Usadas nas Missões" delay={0.14}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topByMission.length === 0 && (
                <p style={{ fontSize: 13, color: "#c4a8c4" }}>Nenhuma florista Em Missão</p>
              )}
              {topByMission.map(({ flower, name, count }, i) => {
                const cfg = flower ? rarityConfig[flower.rarity as keyof typeof rarityConfig] : null
                const maxCount = topByMission[0]?.count ?? 1
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: medal ? 13 : 9, fontWeight: 900, width: 18, flexShrink: 0, textAlign: "center", color: medal ? undefined : "#c4a8c4" }}>
                      {medal ?? `#${i + 1}`}
                    </span>
                    {cfg && (
                      <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "1px 5px", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                        {flower?.rarity.split(" ")[1]}
                      </span>
                    )}
                    <button
                      onClick={() => flower && onSelectFlower?.(flower)}
                      style={{
                        flex: 1, fontSize: 11, fontWeight: 600, color: flower && onSelectFlower ? "#d4608a" : "#3a2a3a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        background: "none", border: "none", padding: 0,
                        cursor: flower && onSelectFlower ? "pointer" : "default",
                        textAlign: "left",
                        textDecoration: flower && onSelectFlower ? "underline" : "none",
                        textDecorationStyle: "dotted",
                      }}
                    >{name}</button>
                    <div style={{ width: 52, height: 5, borderRadius: 999, background: "#f0e8ee", overflow: "hidden", flexShrink: 0 }}>
                      <motion.div
                        style={{ height: "100%", borderRadius: 999, background: cfg?.color ?? "#d4608a" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCount) * 100}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: cfg?.color ?? "#d4608a", flexShrink: 0, width: 22, textAlign: "right" }}>
                      {count}×
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="🔎 Visão Geral" delay={0.18}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visaoGeral.map((s) => (
                <button key={s.label} onClick={() => onStatClick(s.modal)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: s.bg, border: `1px solid ${s.color}18`,
                    borderRadius: 10, padding: "9px 11px",
                    cursor: "pointer", width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 13 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#3a2a3a" }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</span>
                    <span style={{ fontSize: 10, color: s.color, opacity: 0.6 }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Origens */}
        <div className="analytics-row">
          <Card title="🌱 Canteiro — Menos Possuídas" delay={0.2}>
            <OriginFlowers flowers={flowers} origin="Canteiro" color="#15803d" bg="#f0fdf4" border="#86efac" onSelectFlower={onSelectFlower} />
          </Card>
          <Card title="🛒 Mercado — Menos Possuídas" delay={0.24}>
            <OriginFlowers flowers={flowers} origin="Mercado de Flores" color="#7040b0" bg="#f5f0ff" border="#d4bff5" onSelectFlower={onSelectFlower} />
          </Card>
        </div>
      </div>

      <style>{`
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .analytics-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </>
  )
}