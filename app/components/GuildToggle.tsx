"use client"

import type { GuildView } from "@/app/lib/useGuildView"

interface Props {
  value: GuildView
  onChange: (v: GuildView) => void
}

const options: { key: GuildView; label: string }[] = [
  { key: "matriz", label: "🦋 Matriz" },
  { key: "baby",   label: "🧸 Baby" },
]

// Toggle de visualização Matriz/Baby — usado no FocoDaSemanaCard e na tela
// de Missões. É SÓ DE LEITURA: troca qual guilda alimenta a listagem/ranking
// exibido, mas nunca afeta sessão nem nenhuma ação de escrita.
export default function GuildToggle({ value, onChange }: Props) {
  return (
    <div style={{ display: "inline-flex", background: "rgba(200,160,190,0.12)", borderRadius: 999, padding: 2, flexShrink: 0 }}>
      {options.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              background: active ? "white" : "transparent",
              color: active ? "#7B60B0" : "#B8A0B8",
              border: "none", borderRadius: 999,
              padding: "4px 10px", fontSize: 10, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: active ? "0 1px 4px rgba(155,127,204,0.25)" : "none",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
