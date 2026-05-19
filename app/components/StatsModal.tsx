"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"
import type { StatModalType } from "@/app/components/Dashboard"

interface Props {
  type: StatModalType
  flowers: Flower[]
  members: Member[]
  onClose: () => void
}

const rarityOrder = ["❤️ UR", "💛 SSR", "💜 SR", "💙 R", "💚 N"]

const titles: Record<NonNullable<StatModalType>, { icon: string; label: string; color: string }> = {
  flores:          { icon: "🌺", label: "Total de Flores",           color: "#d4608a" },
  floristas:       { icon: "🧑‍🌾", label: "Floristas da Guilda",      color: "#7040b0" },
  ur:              { icon: "❤️", label: "Flores UR na Guilda",        color: "#c0304a" },
  ssr:             { icon: "💛", label: "Flores SSR na Guilda",       color: "#b07010" },
  unicas:          { icon: "✨", label: "Flores Exclusivas (1 dono)", color: "#6040a0" },
  colecao:         { icon: "🎯", label: "Progresso da Coleção",       color: "#1a8a3a" },
  sem_dono:        { icon: "🌿", label: "Flores que Ninguém Tem",     color: "#059669" },
  missoes:         { icon: "🎯", label: "Em Missão",                  color: "#15803d" },
}

function FlowerTag({ f, cfg }: { f: Flower; cfg: { bg: string; color: string } | undefined }) {
  return (
    <span style={{
      background: cfg?.bg ?? "#f0f0f0",
      color: cfg?.color ?? "#666",
      border: `1px solid ${cfg?.color ?? "#ccc"}22`,
      borderRadius: 999,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 600,
    }}>
      {f.name}
    </span>
  )
}

export default function StatsModal({ type, flowers, members, onClose }: Props) {
  if (!type) return null
  const meta = titles[type]

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(30,10,30,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: 520,
          background: "white", borderRadius: 24, overflow: "hidden",
          maxHeight: "85vh",
          boxShadow: "0 32px 80px rgba(30,0,30,0.3)",
        }}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #f0dded",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{meta.icon}</span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: meta.color, margin: 0 }}>
              {meta.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#f0dded", color: "#7a5a7a",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
            }}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: 20, maxHeight: "calc(85vh - 76px)" }}>
          {type === "flores"    && <FloresContent flowers={flowers} />}
          {type === "floristas" && <FloristasContent flowers={flowers} members={members} />}
          {type === "ur"        && <RarityContent flowers={flowers} rarity="❤️ UR" members={members} />}
          {type === "ssr"       && <RarityContent flowers={flowers} rarity="💛 SSR" members={members} />}
          {type === "unicas"    && <UnicasContent flowers={flowers} members={members} />}
          {type === "colecao"   && <ColecaoContent flowers={flowers} />}
          {type === "sem_dono"  && <SemDonoContent flowers={flowers} />}
          {type === "missoes"   && <MissoesContent members={members} flowers={flowers} />}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Conteúdos ── */

function FloresContent({ flowers }: { flowers: Flower[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {rarityOrder.map((r) => {
        const group = flowers.filter((f) => f.rarity === r)
        if (!group.length) return null
        const cfg = rarityConfig[r as keyof typeof rarityConfig]
        return (
          <div key={r}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>
                {r}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b89ab8" }}>{group.length} flores</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.map((f) => <FlowerTag key={f.id} f={f} cfg={cfg} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FloristasContent({ flowers, members }: { flowers: Flower[]; members: Member[] }) {
  const ranked = members
    .map((m) => ({ member: m, count: flowers.filter((f) => m.flowers.includes(f.name)).length }))
    .sort((a, b) => b.count - a.count)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {ranked.map(({ member, count }, i) => (
        <div key={member.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#FFF9F2", border: "1px solid #f0dded",
          borderRadius: 14, padding: "10px 14px",
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900,
            background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : "#FFF0F5",
            color: i === 0 ? "#b07010" : i === 1 ? "#606080" : "#d4608a",
          }}>#{i + 1}</span>
          <span style={{ flex: 1, fontWeight: 800, color: "#3a2a3a" }}>{member.name}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#d4608a" }}>{count} 🌸</span>
        </div>
      ))}
    </div>
  )
}

function RarityContent({ flowers, rarity, members }: { flowers: Flower[]; rarity: string; members: Member[] }) {
  const group = flowers.filter((f) => f.rarity === rarity)
  const cfg = rarityConfig[rarity as keyof typeof rarityConfig]

  if (group.length === 0) return (
    <p style={{ padding: "32px 0", textAlign: "center", fontWeight: 700, color: "#b89ab8" }}>
      Nenhuma flor {rarity} na guilda ainda
    </p>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Resumo */}
      <div style={{
        background: cfg?.bg, border: `1px solid ${cfg?.color}22`,
        borderRadius: 14, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: cfg?.color }}>
          {group.length} flores {rarity} na guilda
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: cfg?.color }}>
          {group.filter((f) => f.owners > 0).length} possuídas · {group.filter((f) => f.owners === 0).length} ninguém tem
        </span>
      </div>

      {group.map((f) => {
        const owners = members.filter((m) => m.flowers.includes(f.name))
        return (
          <div key={f.id} style={{
            background: cfg?.bg ?? "#FFF9F2",
            border: `1px solid ${cfg?.color ?? "#f0dded"}22`,
            borderRadius: 16, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: owners.length > 0 ? 10 : 0 }}>
              <span style={{ fontWeight: 900, color: "#3a2a3a" }}>{f.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: cfg?.color }}>⭐ {f.points} pts</span>
            </div>
            {owners.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {owners.map((m) => (
                  <span key={m.id} style={{
                    background: "rgba(255,255,255,0.8)", color: "#7a5a7a",
                    borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 700,
                  }}>{m.name}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, fontWeight: 600, color: "#b89ab8", margin: 0 }}>
                🌿 Ninguém possui ainda
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function UnicasContent({ flowers, members }: { flowers: Flower[]; members: Member[] }) {
  const unique = flowers.filter((f) => f.owners === 1)

  if (unique.length === 0) return (
    <p style={{ padding: "32px 0", textAlign: "center", fontWeight: 700, color: "#b89ab8" }}>
      Nenhuma flor exclusiva encontrada
    </p>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#9a7ab0", marginBottom: 4 }}>
        Flores que apenas <strong>uma florista</strong> possui na guilda:
      </p>
      {unique.map((f) => {
        const cfg = rarityConfig[f.rarity as keyof typeof rarityConfig]
        const owner = members.find((m) => m.flowers.includes(f.name))
        return (
          <div key={f.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: cfg?.bg ?? "#FFF9F2",
            border: `1px solid ${cfg?.color ?? "#f0dded"}22`,
            borderRadius: 14, padding: "10px 14px",
          }}>
            <span style={{ background: "white", color: cfg?.color, borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              {f.rarity}
            </span>
            <span style={{ flex: 1, fontWeight: 800, color: "#3a2a3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
            {owner && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9a7ab0", flexShrink: 0 }}>
                ✨ {owner.name}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SemDonoContent({ flowers }: { flowers: Flower[] }) {
  const semDono = flowers.filter((f) => f.owners === 0)

  if (semDono.length === 0) return (
    <p style={{ padding: "32px 0", textAlign: "center", fontWeight: 700, color: "#b89ab8" }}>
      🎉 Todas as flores têm pelo menos uma dona!
    </p>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: "#F0FDF4", border: "1px solid #86efac",
        borderRadius: 14, padding: "12px 16px",
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>
          🌿 Estas {semDono.length} flores existem no jogo mas <strong>nenhuma florista da guilda possui ainda</strong>.
          São oportunidades de coleção!
        </p>
      </div>

      {rarityOrder.map((r) => {
        const group = semDono.filter((f) => f.rarity === r)
        if (!group.length) return null
        const cfg = rarityConfig[r as keyof typeof rarityConfig]
        return (
          <div key={r}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>
                {r}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b89ab8" }}>{group.length} flores</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.map((f) => <FlowerTag key={f.id} f={f} cfg={cfg} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ColecaoContent({ flowers }: { flowers: Flower[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rarityOrder.map((r) => {
        const total = flowers.filter((f) => f.rarity === r).length
        const owned = flowers.filter((f) => f.rarity === r && f.owners > 0).length
        if (!total) return null
        const cfg = rarityConfig[r as keyof typeof rarityConfig]
        const pct = Math.round((owned / total) * 100)
        return (
          <div key={r}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ background: cfg?.bg, color: cfg?.color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>
                {r}
              </span>
              <span style={{ fontSize: 13, fontWeight: 900, color: cfg?.color }}>
                {owned}/{total} — {pct}%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "#f0e8ee", overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", borderRadius: 999, background: cfg?.color ?? "#d4608a" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MissoesContent({ members, flowers }: { members: Member[]; flowers: Flower[] }) {
  const [query, setQuery] = React.useState("")

  const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
    "Em Missão": { bg: "#DCFCE7", color: "#15803D", dot: "#22c55e" },
    "Concluiu":  { bg: "#EFF6FF", color: "#2060C0", dot: "#60a5fa" },
    "Pausada":   { bg: "#FEF3C7", color: "#B45309", dot: "#f59e0b" },
    "Fora":      { bg: "#F1F5F9", color: "#64748B", dot: "#94a3b8" },
  }

  const all = members
    .filter((m) => m.status === "Em Missão")
    .map((m) => ({
      member: m,
      compFlowers: flowers.filter((f) => m.favorites.includes(f.name)),
    }))
    .sort((a, b) => b.compFlowers.length - a.compFlowers.length)

  const active = query.trim()
    ? all.filter(({ member }) => member.name.toLowerCase().includes(query.toLowerCase()))
    : all

  if (all.length === 0) return (
    <p style={{ padding: "32px 0", textAlign: "center", fontWeight: 700, color: "#b89ab8" }}>
      Nenhuma florista Em Missão no momento
    </p>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Busca */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#f8f4fb", border: "1.5px solid #eddde8",
        borderRadius: 12, padding: "7px 12px",
      }}>
        <span style={{ fontSize: 14, opacity: 0.5 }}>🔎</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar florista..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 13, fontWeight: 500, color: "#3a2a3a",
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#b89ab8" }}>✕</button>
        )}
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: "#9a7ab0", margin: 0 }}>
        {active.length} de {all.length} floristas Em Missão{query ? ` — "${query}"` : ""}:
      </p>

      {active.length === 0 && (
        <p style={{ textAlign: "center", color: "#c4a8c4", fontSize: 13, padding: "20px 0" }}>Nenhuma florista encontrada</p>
      )}

      {active.map(({ member, compFlowers }) => {
        const cfg = statusConfig["Em Missão"]
        return (
          <div key={member.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#DCFCE733", border: "1px solid #86efac44",
            borderRadius: 14, padding: "10px 14px",
          }}>
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #f9d0e0, #e8d4f8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: "white",
              }}>
                {member.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 800, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.name}
              </p>
              <p style={{ fontSize: 11, color: "#15803d", fontWeight: 600, margin: 0 }}>
                {compFlowers.length > 0
                  ? `${compFlowers.length} flor${compFlowers.length > 1 ? "es" : ""} na competição`
                  : "Sem flores cadastradas"}
              </p>
            </div>
            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.dot}44`, borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />

              Em Missão
            </span>
          </div>
        )
      })}
    </div>
  )
}