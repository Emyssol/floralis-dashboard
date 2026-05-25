"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

// ── Normalização de acentos ──────────────────────────────────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function matches(text: string, query: string): boolean {
  return normalize(text).includes(normalize(query))
}

// ── Initials helper ──────────────────────────────────────────────────
function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase()
}

// ── Types ────────────────────────────────────────────────────────────
interface Props {
  flowers: Flower[]
  members: Member[]
  onSelectFlower: (f: Flower) => void
  onSelectMember: (m: Member) => void
  onViewAllFlowers: () => void
  onViewAllMembers: () => void
  onViewAllMissions: () => void
}

interface SearchResults {
  flowers: Flower[]
  flowersTotal: number
  members: Member[]
  membersTotal: number
  inMission: Member[]
  inMissionTotal: number
}

const LIMIT_FLOWERS  = 6
const LIMIT_MEMBERS  = 6
const LIMIT_MISSIONS = 4

// ── Mini Member Card ─────────────────────────────────────────────────
function MemberMini({ member, query, onClick }: { member: Member; query: string; onClick: () => void }) {
  const ini = initials(member.name)
  const matchedFlower = member.flowers.find((f) => matches(f, query)) ||
                        member.favorites.find((f) => matches(f, query))
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(200,160,190,0.20)",
        borderRadius: 14, padding: "9px 12px",
        cursor: "pointer", textAlign: "left", width: "100%",
        boxShadow: "0 2px 10px rgba(160,100,140,0.06)",
      }}
    >
      {member.avatar
        ? <img src={member.avatar} alt={member.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#f5d0e0,#ddc8f4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "white" }}>{ini}</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 800, fontSize: 13, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</p>
        {matchedFlower && (
          <p style={{ fontSize: 11, color: "#C8849E", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🌸 {matchedFlower}
          </p>
        )}
        {!matchedFlower && (
          <p style={{ fontSize: 11, color: "#B8A0B8", margin: 0 }}>{member.cargo} · {member.flowers.length} flores</p>
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 7px", flexShrink: 0,
        background: member.status === "Em Missão" ? "#DCFCE7" : "rgba(200,160,190,0.12)",
        color: member.status === "Em Missão" ? "#15803D" : "#B8A0B8",
      }}>{member.status}</span>
    </motion.button>
  )
}

// ── Flower Mini Card ─────────────────────────────────────────────────
function FlowerMini({ flower, members, onClick }: { flower: Flower; members: Member[]; onClick: () => void }) {
  const rarity = rarityConfig[flower.rarity as keyof typeof rarityConfig]
  const ownerCount = members.filter((m) => m.flowers.includes(flower.name)).length
  const inMission  = members.filter((m) => m.status === "Em Missão" && m.favorites.includes(flower.name)).length
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: rarity?.bg ?? "rgba(255,245,248,0.88)",
        border: `1px solid ${rarity?.color ?? "#C8849E"}22`,
        borderRadius: 14, padding: "9px 12px",
        cursor: "pointer", textAlign: "left", width: "100%",
        boxShadow: "0 2px 10px rgba(160,100,140,0.06)",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.5)" }}>
        {flower.image
          ? <img src={flower.image} alt={flower.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌸</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 800, fontSize: 13, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{flower.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.7)", color: rarity?.color ?? "#C8849E", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>{flower.rarity}</span>
          <span style={{ fontSize: 10, color: "#B8A0B8", fontWeight: 600 }}>⭐{flower.points}</span>
          {ownerCount > 0 && <span style={{ fontSize: 10, color: "#B8A0B8", fontWeight: 600 }}>👑 {ownerCount}</span>}
          {inMission > 0 && <span style={{ fontSize: 10, color: "#C8849E", fontWeight: 700 }}>🎯 {inMission} usando</span>}
        </div>
      </div>
    </motion.button>
  )
}

// ── Section header ───────────────────────────────────────────────────
function SectionHeader({ icon, title, count, onViewAll }: { icon: string; title: string; count: number; total: number; onViewAll?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#4D3750" }}>{title}</span>
        <span style={{ background: "rgba(200,132,158,0.12)", color: "#C8849E", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{count}</span>
      </div>
      {onViewAll && (
        <button onClick={onViewAll} style={{ fontSize: 11, fontWeight: 700, color: "#C8849E", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>
          Ver todas →
        </button>
      )}
    </div>
  )
}

// ── Main GlobalSearch ────────────────────────────────────────────────
export default function GlobalSearch({ flowers, members, onSelectFlower, onSelectMember, onViewAllFlowers, onViewAllMembers, onViewAllMissions }: Props) {
  const [input, setInput]     = useState("")
  const [query, setQuery]     = useState("")
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  // Debounce 250ms
  const handleChange = useCallback((val: string) => {
    setInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setQuery(val), 250)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setInput(""); setQuery("") } }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])

  const results: SearchResults | null = useMemo(() => {
    const q = query.trim()
    if (!q) return null

    const allFlowers = flowers.filter((f) =>
      matches(f.name, q) || matches(f.rarity, q) || matches(f.origin, q)
    )
    const allMembers = members.filter((m) =>
      matches(m.name, q) ||
      m.flowers.some((fn) => matches(fn, q)) ||
      m.favorites.some((fn) => matches(fn, q)) ||
      matches(m.cargo ?? "", q)
    )
    const allMission = members.filter((m) =>
      m.status === "Em Missão" && (
        matches(m.name, q) ||
        m.favorites.some((fn) => matches(fn, q))
      )
    ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

    return {
      flowers:        allFlowers.slice(0, LIMIT_FLOWERS),
      flowersTotal:   allFlowers.length,
      members:        allMembers.slice(0, LIMIT_MEMBERS),
      membersTotal:   allMembers.length,
      inMission:      allMission.slice(0, LIMIT_MISSIONS),
      inMissionTotal: allMission.length,
    }
  }, [query, flowers, members])

  const hasResults = results && (results.flowersTotal > 0 || results.membersTotal > 0 || results.inMissionTotal > 0)
  const showPanel  = query.trim().length > 0

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: focused ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        border: focused ? "1.5px solid rgba(200,132,158,0.50)" : "1px solid rgba(200,160,190,0.22)",
        borderRadius: showPanel ? "14px 14px 0 0" : 14,
        padding: "11px 16px",
        boxShadow: focused
          ? "0 4px 20px rgba(200,132,158,0.15)"
          : "0 2px 12px rgba(160,100,140,0.06)",
        transition: "all 0.2s ease",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={focused ? "#C8849E" : "#B8A0B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "stroke 0.2s" }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Pesquisar flor, florista, raridade, origem..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#4D3750", caretColor: "#C8849E" }}
        />
        {input && (
          <button onClick={() => { setInput(""); setQuery(""); inputRef.current?.focus() }} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(200,132,158,0.12)", border: "1px solid rgba(200,132,158,0.20)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#C8849E" }}>✕</button>
        )}
      </div>

      {/* Results panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 40,
              background: "rgba(255,252,254,0.98)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1.5px solid rgba(200,132,158,0.20)",
              borderTop: "1px solid rgba(200,160,190,0.12)",
              borderRadius: "0 0 18px 18px",
              boxShadow: "0 16px 48px rgba(160,80,120,0.14)",
              maxHeight: "70vh", overflowY: "auto",
              padding: "16px 16px 20px",
            }}
          >
            {!hasResults ? (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <p style={{ fontSize: 32, margin: 0 }}>🔎</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#C4A8C4", marginTop: 10 }}>
                  Nenhum resultado para <strong style={{ color: "#9a7ab0" }}>"{query}"</strong>
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* 🌸 Flores */}
                {results!.flowersTotal > 0 && (
                  <section>
                    <SectionHeader
                      icon="🌸" title="Flores" count={results!.flowersTotal} total={results!.flowersTotal}
                      onViewAll={results!.flowersTotal > LIMIT_FLOWERS ? () => { setInput(""); setQuery(""); onViewAllFlowers() } : undefined}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {results!.flowers.map((f) => (
                        <FlowerMini key={f.id} flower={f} members={members} onClick={() => { onSelectFlower(f); setInput(""); setQuery("") }} />
                      ))}
                    </div>
                    {results!.flowersTotal > LIMIT_FLOWERS && (
                      <button onClick={() => { setInput(""); setQuery(""); onViewAllFlowers() }} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#C8849E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        + {results!.flowersTotal - LIMIT_FLOWERS} flores → Ver todas na Coleção
                      </button>
                    )}
                  </section>
                )}

                {/* 🧑‍🌾 Floristas */}
                {results!.membersTotal > 0 && (
                  <section>
                    <SectionHeader
                      icon="🧑‍🌾" title="Floristas" count={results!.membersTotal} total={results!.membersTotal}
                      onViewAll={results!.membersTotal > LIMIT_MEMBERS ? () => { setInput(""); setQuery(""); onViewAllMembers() } : undefined}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {results!.members.map((m) => (
                        <MemberMini key={m.id} member={m} query={query} onClick={() => { onSelectMember(m); setInput(""); setQuery("") }} />
                      ))}
                    </div>
                    {results!.membersTotal > LIMIT_MEMBERS && (
                      <button onClick={() => { setInput(""); setQuery(""); onViewAllMembers() }} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#C8849E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        + {results!.membersTotal - LIMIT_MEMBERS} floristas → Ver todas
                      </button>
                    )}
                  </section>
                )}

                {/* 🎯 Em Missão */}
                {results!.inMissionTotal > 0 && (
                  <section>
                    <SectionHeader
                      icon="🎯" title="Em Missão com esta flor" count={results!.inMissionTotal} total={results!.inMissionTotal}
                      onViewAll={results!.inMissionTotal > LIMIT_MISSIONS ? () => { setInput(""); setQuery(""); onViewAllMissions() } : undefined}
                    />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {results!.inMission.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { onSelectMember(m); setInput(""); setQuery("") }}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#DCFCE7", color: "#15803D", border: "1px solid #86efac44", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                          {m.name}
                        </button>
                      ))}
                      {results!.inMissionTotal > LIMIT_MISSIONS && (
                        <button onClick={() => { setInput(""); setQuery(""); onViewAllMissions() }} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(200,132,158,0.10)", color: "#C8849E", border: "1px solid rgba(200,132,158,0.20)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          +{results!.inMissionTotal - LIMIT_MISSIONS} → Ver missões
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* 📊 Resumo rápido */}
                {results!.flowersTotal > 0 && (
                  <section style={{ background: "rgba(200,132,158,0.05)", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(200,132,158,0.12)" }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#9a7ab0", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>📊 Resumo</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#4D3750", fontWeight: 600 }}>
                        👑 <strong>{results!.flowers.reduce((acc, f) => acc + f.owners, 0)}</strong> possuem
                      </span>
                      <span style={{ fontSize: 12, color: "#4D3750", fontWeight: 600 }}>
                        🎯 <strong>{results!.inMissionTotal}</strong> disputando
                      </span>
                      <span style={{ fontSize: 12, color: "#4D3750", fontWeight: 600 }}>
                        🌸 <strong>{results!.flowersTotal}</strong> flor{results!.flowersTotal !== 1 ? "es" : ""} encontrada{results!.flowersTotal !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </section>
                )}

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}