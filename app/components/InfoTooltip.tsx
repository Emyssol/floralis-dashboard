"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  text: string
}

// Botão de ajuda "?" — clique (não hover, que não existe em touch) abre um
// popover com uma explicação curta da seção/modal. Fecha ao clicar fora.
// Reaproveitado em todo o app pra não duplicar essa lógica de popover.
export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="Mais informações"
        style={{
          width: 18, height: 18, borderRadius: "50%",
          background: open ? "rgba(200,132,158,0.22)" : "rgba(200,160,190,0.14)",
          border: "1px solid rgba(200,160,190,0.30)",
          color: "#85667F", fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontFamily: "inherit", padding: 0, lineHeight: 1,
        }}
      >
        ?
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 80,
          width: 230,
          background: "rgba(255,248,251,0.98)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(200,160,190,0.22)",
          borderRadius: 14, padding: "10px 12px",
          boxShadow: "0 12px 32px rgba(80,30,60,0.18)",
          fontSize: 11, fontWeight: 600, color: "#4D3750", lineHeight: 1.5,
        }}>
          {text}
        </div>
      )}
    </div>
  )
}
