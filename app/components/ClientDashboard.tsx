"use client"

import { useEffect, useState } from "react"
import Dashboard from "@/app/components/Dashboard"
import type { Flower, Member } from "@/app/lib/types"

function Skeleton() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FFF5F8 0%, #F8F0FF 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20,
    }}>
      {/* Logo animado */}
      <div style={{ fontSize: 56, animation: "pulse 1.5s ease-in-out infinite" }}>🌸</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#d4608a", margin: 0 }}>
          FLORALIS
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#b89ab8", marginTop: 6 }}>
          Carregando dados do Notion...
        </p>
      </div>

      {/* Barra de progresso animada */}
      <div style={{
        width: 200, height: 4, background: "#f0dded", borderRadius: 999, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #d4608a, #9B4FD4)",
          borderRadius: 999,
          animation: "loading 1.4s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FFF5F8 0%, #F8F0FF 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 16,
    }}>
      <p style={{ fontSize: 42 }}>😢</p>
      <p style={{ fontSize: 16, fontWeight: 800, color: "#c0304a" }}>Erro ao carregar</p>
      <p style={{ fontSize: 13, color: "#9a7ab0", maxWidth: 300, textAlign: "center" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          background: "linear-gradient(135deg, #d4608a, #9B4FD4)",
          border: "none", borderRadius: 12,
          padding: "10px 24px",
          color: "white", fontWeight: 800, fontSize: 13,
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}

export default function ClientDashboard() {
  const [flowers, setFlowers]   = useState<Flower[]>([])
  const [members, setMembers]   = useState<Member[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFlowers(data.flowers ?? [])
      setMembers(data.members ?? [])
    } catch (e: any) {
      setError(e.message ?? "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <Skeleton />
  if (error)   return <ErrorState message={error} onRetry={load} />

  return <Dashboard flowers={flowers} members={members} />
}