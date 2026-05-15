"use client"

import { motion } from "framer-motion"
import type { Flower, Member } from "@/app/lib/types"

const cargoColors: Record<string, { bg: string; color: string }> = {
  Líder: { bg: "#FFF8E0", color: "#B07010" },
  "Co-Líder": { bg: "#F5F0FF", color: "#7040B0" },
  Oficial: { bg: "#FFF0F5", color: "#d4608a" },
  Membro: { bg: "#F0F5FF", color: "#3060C0" },
}

const statusDot: Record<string, string> = {
  Ativo: "#22C55E",
  Online: "#22C55E",
  Offline: "#94A3B8",
  Inativo: "#94A3B8",
  Ocupado: "#F59E0B",
}

interface Props {
  member: Member
  flowers: Flower[]
  onClick?: () => void
}

export default function MemberCard({ member, flowers, onClick }: Props) {
  const cargo = cargoColors[member.cargo] ?? { bg: "#F0F5FF", color: "#3060C0" }
  const dot = statusDot[member.status] ?? "#94A3B8"

  const ownedFlowers = flowers.filter((f) =>
    member.flowers.includes(f.name)
  )
  const displayFlowers = ownedFlowers.slice(0, 4)
  const extra = ownedFlowers.length - displayFlowers.length

  return (
    <motion.article
      onClick={onClick}
      className="glow-card overflow-hidden rounded-3xl bg-white p-5"
      style={{ cursor: onClick ? "pointer" : "default" }}
      whileHover={{ y: -4, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {/* Top row: avatar + info */}
      <div className="mb-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="h-16 w-16 rounded-2xl object-cover"
              style={{
                boxShadow: "0 4px 16px rgba(212,96,138,0.2)",
              }}
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{
                background: "linear-gradient(135deg, #FFF0F5, #F5EEF9)",
                boxShadow: "0 4px 16px rgba(212,96,138,0.12)",
              }}
            >
              🌸
            </div>
          )}
          {/* Status dot */}
          <span
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white"
            style={{ background: dot }}
          />
        </div>

        {/* Name + cargo + status */}
        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-lg font-black leading-tight"
            style={{ color: "#3a2a3a" }}
          >
            {member.name}
          </h2>
          <span
            className="badge-cargo mt-1"
            style={{ background: cargo.bg, color: cargo.color }}
          >
            {member.cargo}
          </span>
          <p className="mt-1 text-xs font-semibold" style={{ color: "#b89ab8" }}>
            {member.status}
          </p>
        </div>

        {/* Flower count */}
        <div
          className="shrink-0 rounded-xl px-3 py-2 text-center"
          style={{ background: "#FFF0F5" }}
        >
          <p className="text-lg font-black" style={{ color: "#d4608a" }}>
            {ownedFlowers.length}
          </p>
          <p className="text-xs font-bold" style={{ color: "#c47eb8" }}>flores</p>
        </div>
      </div>

      {/* Flower tags */}
      {displayFlowers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayFlowers.map((f) => (
            <span
              key={f.id}
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                background: "#FFF5F8",
                color: "#c47eb8",
                border: "1px solid #f9c8dc",
              }}
            >
              {f.name}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                background: "#F5F0FF",
                color: "#8B5CF6",
                border: "1px solid #d4bff5",
              }}
            >
              +{extra} mais
            </span>
          )}
        </div>
      )}

      {/* Favorites */}
      {member.favorites.length > 0 && (
        <div
          className="mt-3 border-t pt-3 text-xs font-semibold"
          style={{ borderColor: "#f0dded", color: "#c47eb8" }}
        >
          💎 Favoritas: {member.favorites.slice(0, 3).join(", ")}
          {member.favorites.length > 3 && "..."}
        </div>
      )}
    </motion.article>
  )
}
