"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { ToastState } from "@/app/lib/useToast"

interface Props {
  toast: ToastState | null
}

const toneStyle: Record<ToastState["tone"], { bg: string; color: string }> = {
  success: { bg: "#E7F5EC", color: "#22B573" },
  neutral: { bg: "#FDF0F5", color: "#93677A" },
}

// Pill de feedback não-bloqueante (ver useToast em app/lib/useToast.ts) —
// usado em qualquer lugar onde o clique no card já salva na hora.
export default function Toast({ toast }: Props) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          style={{
            display: "inline-flex", alignItems: "center",
            background: toneStyle[toast.tone].bg,
            color: toneStyle[toast.tone].color,
            borderRadius: 999, padding: "6px 14px",
            fontSize: 12, fontWeight: 800,
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
