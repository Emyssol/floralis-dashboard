"use client"

import { signIn, signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div style={{ fontSize: 12, color: "#c4a8c4" }}>Carregando...</div>
  }

  if (session?.user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? "Avatar"}
            style={{ width: 28, height: 28, borderRadius: "50%" }}
          />
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color: "#7040A8" }}>
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          style={{
            fontSize: 12, fontWeight: 700, color: "#C8849E",
            background: "transparent", border: "none", cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      style={{
        fontSize: 13, fontWeight: 700, color: "#fff",
        background: "#7040A8", borderRadius: 10, border: "none",
        padding: "8px 14px", cursor: "pointer",
      }}
    >
      Entrar com Google 🌸
    </button>
  )
}