"use client"

import { useEffect, useState, useTransition } from "react"
import Dashboard from "@/app/components/Dashboard"
import type { Flower, Member } from "@/app/lib/types"

interface Props {
  initialFlowers?: Flower[]
  initialMembers?: Member[]
  onRevalidate?: () => Promise<void>
}

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

export default function ClientDashboard({ initialFlowers, initialMembers, onRevalidate }: Props) {
  const [flowers, setFlowers]   = useState<Flower[]>(initialFlowers ?? [])
  const [members, setMembers]   = useState<Member[]>(initialMembers ?? [])
  const [loading, setLoading]   = useState(!initialFlowers)
  const [error, setError]       = useState("")
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  useEffect(() => { setMounted(true); if (initialFlowers) setLastUpdated(new Date()) }, [])

  function handleFlowerOwned(flowerId: string, floristaId: string) {
    const flowerName = flowers.find((f) => f.id === flowerId)?.name
    if (!flowerName) return

    setMembers((prev) =>
      prev.map((m) =>
        m.id === floristaId && !m.flowers.includes(flowerName)
          ? { ...m, flowers: [...m.flowers, flowerName] }
          : m
      )
    )
    setFlowers((prev) =>
      prev.map((f) => (f.id === flowerId ? { ...f, owners: f.owners + 1 } : f))
    )
  }

  async function load(forceRefresh = false) {
    setLoading(true)
    setError("")
    try {
      const url = forceRefresh ? "/api/dashboard?refresh=1" : "/api/dashboard"
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFlowers(data.flowers ?? [])
      setMembers(data.members ?? [])
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message ?? "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  function handleRefresh() {
    if (onRevalidate) {
      startTransition(async () => {
        await onRevalidate()
        await load(true)
      })
    } else {
      load(true)
    }
  }

  useEffect(() => {
    // Só busca client-side se não veio com dados do servidor
    if (!initialFlowers) load()
  }, [])

  if (loading) return <Skeleton />
  if (error)   return <ErrorState message={error} onRetry={load} />

  return (
    <>
      <Dashboard flowers={flowers} members={members} onFlowerOwned={handleFlowerOwned} />
      {/* Botão de atualização flutuante */}
      <button
        onClick={handleRefresh}
        disabled={isPending || loading}
        title={mounted && lastUpdated ? `Atualizado: ${lastUpdated.toLocaleTimeString("pt-BR")}` : "Atualizar dados"}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99,
          width: 48, height: 48, borderRadius: "50%",
          background: isPending || loading
            ? "rgba(200,132,158,0.5)"
            : "linear-gradient(135deg, #d4608a, #9B4FD4)",
          border: "none", cursor: isPending || loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(200,132,158,0.35)",
          transition: "all 0.2s",
          animation: isPending || loading ? "spin 1s linear infinite" : "none",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: isPending || loading ? "spin 1s linear infinite" : "none" }}>
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}