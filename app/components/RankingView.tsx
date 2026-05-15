"use client"

import { motion } from "framer-motion"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  flowers: Flower[]
  members: Member[]
  onSelectMember: (m: Member) => void
}

interface RankedMember {
  member: Member
  score: number
  flowerCount: number
  urCount: number
}

const podiumStyle = [
  {
    rank: 1,
    bg: "linear-gradient(135deg, #FFF8E0, #FEF3C7)",
    border: "#FDE68A",
    shadow: "rgba(215,155,30,0.25)",
    color: "#B07010",
    icon: "🥇",
    size: "h-24 w-24",
  },
  {
    rank: 2,
    bg: "linear-gradient(135deg, #F8F8FC, #F1F1F5)",
    border: "#E0E0E8",
    shadow: "rgba(120,120,160,0.18)",
    color: "#606080",
    icon: "🥈",
    size: "h-20 w-20",
  },
  {
    rank: 3,
    bg: "linear-gradient(135deg, #FFF5EE, #FEE9D4)",
    border: "#FDDCB4",
    shadow: "rgba(180,100,50,0.18)",
    color: "#A05020",
    icon: "🥉",
    size: "h-16 w-16",
  },
]

function getRankedMembers(flowers: Flower[], members: Member[]): RankedMember[] {
  return members
    .map((m) => {
      const owned = flowers.filter((f) => m.flowers.includes(f.name))
      return {
        member: m,
        score: owned.reduce((acc, f) => acc + f.points, 0),
        flowerCount: owned.length,
        urCount: owned.filter((f) => f.rarity === "❤️ UR").length,
      }
    })
    .sort((a, b) => b.score - a.score || b.flowerCount - a.flowerCount)
}

export default function RankingView({ flowers, members, onSelectMember }: Props) {
  const ranked = getRankedMembers(flowers, members)
  const top3 = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  const podiumOrder = top3.length === 3
    ? [top3[1], top3[0], top3[2]]
    : top3

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black" style={{ color: "#3a2a3a" }}>🏆 Ranking de Floristas</h2>
        <p className="mt-1 text-sm font-semibold" style={{ color: "#b89ab8" }}>
          Classificação por pontuação total das flores possuídas
        </p>
      </div>

      {/* ── Podium ── */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 pb-4">
          {(top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3).map(
            (entry, displayIndex) => {
              const realRank = top3.length === 3
                ? [2, 1, 3][displayIndex]
                : displayIndex + 1
              const style = podiumStyle[realRank - 1]

              return (
                <motion.div
                  key={entry.member.id}
                  className="flex cursor-pointer flex-col items-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: displayIndex * 0.1, duration: 0.5 }}
                  onClick={() => onSelectMember(entry.member)}
                >
                  {/* Icon */}
                  <span className="mb-2 text-3xl">{style.icon}</span>

                  {/* Avatar */}
                  <div
                    className={`${style.size} overflow-hidden rounded-2xl`}
                    style={{
                      background: style.bg,
                      border: `2px solid ${style.border}`,
                      boxShadow: `0 8px 32px ${style.shadow}`,
                    }}
                  >
                    {entry.member.avatar ? (
                      <img
                        src={entry.member.avatar}
                        alt={entry.member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        🌸
                      </div>
                    )}
                  </div>

                  {/* Podium bar */}
                  <div
                    className="mt-2 w-24 rounded-t-xl text-center"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderBottom: "none",
                      height: realRank === 1 ? 64 : realRank === 2 ? 48 : 32,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      paddingTop: 8,
                    }}
                  >
                    <p className="text-xs font-black" style={{ color: style.color }}>#{realRank}</p>
                  </div>

                  {/* Name + score */}
                  <div className="mt-2 max-w-[96px] text-center">
                    <p className="truncate text-sm font-black" style={{ color: "#3a2a3a" }}>
                      {entry.member.name}
                    </p>
                    <p className="text-xs font-bold" style={{ color: "#b89ab8" }}>
                      ⭐ {entry.score.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </motion.div>
              )
            }
          )}
        </div>
      )}

      {/* ── Full leaderboard ── */}
      <div className="space-y-2">
        {ranked.map((entry, i) => (
          <motion.div
            key={entry.member.id}
            className="flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01]"
            style={{
              background: i < 3 ? "rgba(255,248,240,0.9)" : "white",
              border: "1px solid #f0dded",
              boxShadow: "0 2px 8px rgba(180,100,140,0.05)",
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            onClick={() => onSelectMember(entry.member)}
          >
            {/* Rank number */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
              style={{
                background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : i === 2 ? "#FEE9D4" : "#FFF9F2",
                color: i === 0 ? "#B07010" : i === 1 ? "#606080" : i === 2 ? "#A05020" : "#b89ab8",
              }}
            >
              #{i + 1}
            </div>

            {/* Avatar */}
            {entry.member.avatar ? (
              <img
                src={entry.member.avatar}
                alt={entry.member.name}
                className="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: "#FFF0F5" }}
              >
                🌸
              </div>
            )}

            {/* Name + cargo */}
            <div className="flex-1 min-w-0">
              <p className="truncate font-black" style={{ color: "#3a2a3a" }}>
                {entry.member.name}
              </p>
              <p className="text-xs font-semibold" style={{ color: "#b89ab8" }}>
                {entry.member.cargo} · {entry.flowerCount} flores
              </p>
            </div>

            {/* Badges */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-black" style={{ color: "#D97706" }}>
                ⭐ {entry.score.toLocaleString("pt-BR")}
              </span>
              {entry.urCount > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-black"
                  style={{
                    background: rarityConfig["❤️ UR"].bg,
                    color: rarityConfig["❤️ UR"].color,
                  }}
                >
                  ❤️ {entry.urCount} UR
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {ranked.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-5xl">🌿</p>
            <p className="mt-4 font-bold" style={{ color: "#b89ab8" }}>
              Nenhum florista cadastrado ainda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
