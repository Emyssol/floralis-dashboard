"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface Props { children: React.ReactNode }

/**
 * Renderiza filhos diretamente no <body>, fora da árvore do Next.js.
 * Isso isola completamente os modais do mix-blend-mode da textura de fundo.
 */
export default function ModalPortal({ children }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}