"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export function LoginButton() {
  const { data: session, status } = useSession()

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
      {status === "loading" ? null : session?.user ? (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(200,160,190,0.25)",
            borderRadius: 999, padding: "6px 8px 6px 6px",
            boxShadow: "0 2px 10px rgba(180,100,140,0.12)",
          }}
        >
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0 }}
            />
          )}
          <span style={{ fontSize: 12, fontWeight: 800, color: "#4D3750", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.user.name}
          </span>
          <button
            onClick={() => signOut()}
            style={{
              fontSize: 11, fontWeight: 700, color: "#C8849E",
              background: "rgba(200,132,158,0.10)", border: "none", borderRadius: 999,
              padding: "5px 10px", cursor: "pointer", flexShrink: 0,
            }}
          >
            Sair
          </button>
        </div>
      ) : (
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
      )}
    </div>
  )
}