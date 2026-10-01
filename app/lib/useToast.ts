"use client"

import { useEffect, useRef, useState } from "react"

export type ToastTone = "success" | "neutral"
export interface ToastState {
  id: number
  message: string
  tone: ToastTone
}

const TOAST_DURATION = 1500

// Feedback não-bloqueante de "já salvou" pra fluxos que gravam por clique,
// sem "confirmar" separado (Coleção em modo de seleção, OwnedFlowersModal,
// CompetitionFlowersModal). Cada chamada de showToast reinicia o timer e
// substitui a mensagem — nunca empilha, mostra sempre só a mais recente
// (mesmo se o texto for idêntico ao anterior, o `id` muda e reanima o toast).
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const idRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(message: string, tone: ToastTone = "success") {
    idRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ id: idRef.current, message, tone })
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION)
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return { toast, showToast }
}
