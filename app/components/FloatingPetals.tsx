"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Petal {
  id: number
  emoji: string
  x: number
  y: number
  size: number
  delay: number
  duration: number
  amplitude: number
}

const EMOJIS = ["🌸", "🌺", "🌼", "🌷", "✿", "🌸", "🌸", "🌼"]

export default function FloatingPetals({ count = 12 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 14 + Math.random() * 20,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 8,
        amplitude: 8 + Math.random() * 16,
      }))
    )
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            opacity: 0.35,
          }}
          animate={{
            y: [-p.amplitude, p.amplitude, -p.amplitude],
            x: [-p.amplitude * 0.4, p.amplitude * 0.4, -p.amplitude * 0.4],
            rotate: [-8, 8, -8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}
