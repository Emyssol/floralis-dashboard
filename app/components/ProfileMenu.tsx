"use client"

import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import ChangePasswordModal from "@/app/components/ChangePasswordModal"
import type { Member } from "@/app/lib/types"

interface Props {
  me: Member | null                // florista correspondente à sessão atual
  onOpenProgressModal: () => void  // abre o MissionProgressModal (contador 0-24)
  onOpenOwned: () => void
  onOpenCompetition: () => void
  onOpenPontos: () => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Hub de ações pessoais no header — substitui o antigo pill "nome + sair" por
// um botão de avatar que abre um dropdown com as ações semanais mais usadas,
// reduzindo de "3 cliques" (abrir perfil → editar → confirmar) pra 1.
export default function ProfileMenu({ me, onOpenProgressModal, onOpenOwned, onOpenCompetition, onOpenPontos }: Props) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  if (status === "loading" || !session?.user) return null

  const name = session.user.name ?? me?.name ?? "Florista"
  const ini = initials(name)

  function runAndClose(fn: () => void) {
    fn()
    setOpen(false)
  }

  const items: { key: string; label: string; onClick: () => void }[] = [
    { key: "owned",      label: "🌸 Adicionar flores",              onClick: onOpenOwned },
    { key: "competicao", label: "🏆 Atualizar flores da competição", onClick: onOpenCompetition },
    { key: "missoes",    label: "✏️ Atualizar progresso de missões",  onClick: onOpenProgressModal },
    { key: "pontos",     label: "⭐ Atualizar pontos extras",        onClick: onOpenPontos },
  ]

  return (
    <div ref={ref} style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${open ? "rgba(200,132,158,0.45)" : "rgba(200,160,190,0.25)"}`,
          borderRadius: 999, padding: "6px 12px 6px 6px",
          boxShadow: "0 2px 10px rgba(180,100,140,0.12)",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {session.user.image ? (
          <img src={session.user.image} alt={name} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
        ) : (
          <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#d4608a,#9B4FD4)", color: "white", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ini}
          </span>
        )}
        <span style={{ fontSize: 12, fontWeight: 800, color: "#4D3750", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B8A0B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          minWidth: 240,
          background: "rgba(255,248,251,0.98)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(200,160,190,0.22)",
          borderRadius: 18,
          padding: 6,
          boxShadow: "0 12px 40px rgba(80,30,60,0.18)",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => runAndClose(it.onClick)}
              style={{
                textAlign: "left", background: "none", border: "none", borderRadius: 12,
                padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#4D3750",
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,132,158,0.10)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}
            >
              {it.label}
            </button>
          ))}

          <div style={{ height: 1, background: "rgba(200,160,190,0.18)", margin: "4px 8px" }} />

          <button
            onClick={() => runAndClose(() => setShowChangePassword(true))}
            style={{ textAlign: "left", background: "none", border: "none", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#4D3750", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,132,158,0.10)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}
          >
            🔑 Trocar senha
          </button>
          <button
            onClick={() => signOut()}
            style={{ textAlign: "left", background: "none", border: "none", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#C8849E", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,132,158,0.10)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}
          >
            🚪 Sair
          </button>
        </div>
      )}

      {showChangePassword && session.user.id && (
        <ChangePasswordModal
          floristaId={session.user.id}
          mode="self"
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
