"use client"

import { useEffect, useState } from "react"

export default function TextureBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/textures/textura-rosa.png')",
        backgroundSize: "520px auto",
        backgroundRepeat: "repeat",
        mixBlendMode: "multiply",
        opacity: 0.55,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}