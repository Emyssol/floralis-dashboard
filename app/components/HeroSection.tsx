"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import FloatingPetals from "@/app/components/FloatingPetals"
import { rarityConfig } from "@/app/lib/rarity"
import type { Flower, Member } from "@/app/lib/types"

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let current = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

interface HeroProps {
  flowers: Flower[]
  members: Member[]
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
}

export default function HeroSection({ flowers, members }: HeroProps) {
  const spotlight =
    flowers.find((f) => f.rarity === "❤️ UR") ||
    flowers.find((f) => f.rarity === "💛 SSR") ||
    flowers[0] ||
    null

  const urCount = flowers.filter((f) => f.rarity === "❤️ UR").length
  const totalPoints = flowers.reduce((acc, f) => acc + f.points, 0)

  const flowerCount = useCountUp(flowers.length)
  const memberCount = useCountUp(members.length)
  const pointsCount = useCountUp(totalPoints)
  const urCounter = useCountUp(urCount)

  const stats = [
    { label: "Flores", value: flowerCount, icon: "🌸", color: "#d4608a" },
    { label: "Floristas", value: memberCount, icon: "👥", color: "#8B5CF6" },
    { label: "Pontos", value: pointsCount, icon: "⭐", color: "#D97706" },
    { label: "Flores UR", value: urCounter, icon: "❤️", color: "#EC4899" },
  ]

  const spotlightRarity = spotlight
    ? rarityConfig[spotlight.rarity as keyof typeof rarityConfig]
    : null

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 480 }}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #FFF5F8 0%, #F8F2FF 35%, #F2F4FF 65%, #F5FFF8 100%)",
        }}
      />

      {/* Ambient orbs */}
      <div
        className="animate-glow-pulse pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,96,138,0.15), transparent 70%)" }}
      />
      <div
        className="animate-glow-pulse pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(156,107,210,0.12), transparent 70%)",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="animate-glow-pulse pointer-events-none absolute bottom-8 left-1/3 h-64 w-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(246,210,143,0.1), transparent 70%)",
          animationDelay: "3s",
        }}
      />

      <FloatingPetals count={14} />

      <div className="relative mx-auto max-w-[1800px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left: título + stats ── */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item}>
              <span
                className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(212,96,138,0.2)",
                  color: "#d4608a",
                }}
              >
                ✨ Dashboard da Guilda Floralis
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mb-3 text-7xl font-black leading-none tracking-tight lg:text-8xl xl:text-9xl"
              style={{
                background: "linear-gradient(135deg, #d4608a 0%, #9B4FD4 50%, #5B6FD4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FLORALIS
            </motion.h1>

            <motion.p
              variants={item}
              className="mb-10 text-lg font-semibold lg:text-xl"
              style={{ color: "#9a7ab0" }}
            >
              Cozy Guild · Magical Garden · Premium Dashboard
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={item}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 4px 20px rgba(180,100,140,0.08)",
                  }}
                >
                  <div className="mb-1 text-xl">{stat.icon}</div>
                  <div
                    className="text-2xl font-black leading-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.value.toLocaleString("pt-BR")}
                  </div>
                  <div
                    className="mt-0.5 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#b89ab8" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: spotlight ── */}
          {spotlight && (
            <motion.div
              className="w-full max-w-xs shrink-0"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.35 }}
            >
              <p
                className="mb-3 text-center text-xs font-bold uppercase tracking-widest"
                style={{ color: "#c47eb8" }}
              >
                ✨ Flor em destaque
              </p>

              <div
                className="overflow-hidden rounded-3xl"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "0 20px 60px rgba(180,100,140,0.18), 0 0 0 1px rgba(255,255,255,0.5)",
                }}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  {spotlight.image ? (
                    <img
                      src={spotlight.image}
                      alt={spotlight.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-8xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFF0F5, #F5EEF9)",
                      }}
                    >
                      🌸
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 55%, rgba(30,0,20,0.3))",
                    }}
                  />
                  {/* Rarity badge on image */}
                  <div className="absolute left-3 top-3">
                    <span
                      className="cozy-pill"
                      style={{
                        background: spotlightRarity?.bg,
                        color: spotlightRarity?.color,
                      }}
                    >
                      {spotlight.rarity}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-xl font-black" style={{ color: "#3a2a3a" }}>
                    {spotlight.name}
                  </h3>
                  <div
                    className="mt-2 flex gap-4 text-sm font-semibold"
                    style={{ color: "#9a7ab0" }}
                  >
                    <span>⭐ {spotlight.points} pts</span>
                    <span>🌙 {spotlight.origin}</span>
                    <span>👥 {spotlight.owners}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
