"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { isBabyGuildString } from "@/app/lib/missoesMax"

export type GuildView = "matriz" | "baby"

// Reexportado daqui pra não quebrar quem já importa isBabyGuildString de
// useGuildView — a implementação real mora em missoesMax.ts (módulo puro,
// sem "use client", usável também no servidor).
export { isBabyGuildString }

// Estado do toggle "Matriz/Baby" (só visualização) — nasce mostrando a
// guilda da conta logada no momento e só muda depois por interação manual
// (o useRef garante que a correção automática roda uma única vez, sem
// sobrescrever um toggle manual já feito). Compartilhado por
// FocoDaSemanaCard e MissoesView.
export function useGuildView(): [GuildView, (v: GuildView) => void] {
  const { data: session } = useSession()
  const [guildView, setGuildView] = useState<GuildView>("matriz")
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !session?.user?.guild) return
    initializedRef.current = true
    setGuildView(isBabyGuildString(session.user.guild) ? "baby" : "matriz")
  }, [session?.user?.guild])

  return [guildView, setGuildView]
}
