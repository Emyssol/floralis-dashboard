"use client"

import { signIn, useSession } from "next-auth/react"

// Quando autenticada, o slot fixo top-right passa a ser do ProfileMenu
// (Dashboard.tsx) — este componente só cuida do botão de entrar.
export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading" || session?.user) return null

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          fontSize: 12, fontWeight: 800, color: "#fff",
          background: "linear-gradient(135deg, #d4608a, #9B4FD4)",
          borderRadius: 999, border: "none",
          padding: "9px 16px", cursor: "pointer",
          boxShadow: "0 2px 10px rgba(180,100,140,0.20)",
        }}
      >
        Entrar com Google 🌸
      </button>
    </div>
  )
}
