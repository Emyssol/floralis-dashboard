"use client"

import { useState } from "react"

interface Props {
  src?: string
  fallbackColor?: string
  opacity?: number
  height?: number
  margin?: string
}

/**
 * Divisor que usa imagem PNG se disponível, com fallback gracioso.
 * Se a imagem falhar (404), renderiza uma linha gradiente suave.
 */
export default function Divider({
  src = "/ornaments/divisor-folhas.png",
  fallbackColor = "rgba(200,160,190,0.22)",
  opacity = 0.25,
  height = 48,
  margin = "20px 0",
}: Props) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div style={{
        margin,
        height: 1,
        background: `linear-gradient(to right, transparent, ${fallbackColor}, transparent)`,
      }} />
    )
  }

  return (
    <div style={{ margin, height, position: "relative", overflow: "hidden" }}>
      <img
        src={src}
        alt=""
        aria-hidden
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          opacity,
          display: "block",
        }}
      />
    </div>
  )
}