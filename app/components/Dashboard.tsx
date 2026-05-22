"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

import StatsGrid from "@/app/components/StatsGrid"
import SearchBar from "@/app/components/SearchBar"
import Filters from "@/app/components/Filters"
import FlowerCard from "@/app/components/FlowerCard"
import FlowerModal from "@/app/components/FlowerModal"
import MemberModal from "@/app/components/MemberModal"
import StatsModal from "@/app/components/StatsModal"
import AnalyticsView from "@/app/components/AnalyticsView"
import FloristasView from "@/app/components/FloristasView"
import MissoesView from "@/app/components/MissoesView"
import SpotlightSearch from "@/app/components/SpotlightSearch"
import WeeklySummary from "@/app/components/WeeklySummary"
import HeroHeader from "@/app/components/HeroHeader"
import FloristasShowcase from "@/app/components/FloristasShowcase"
import CompetitionCarousel from "@/app/components/CompetitionCarousel"
import RareView from "@/app/components/RareView"
import PopularesView from "@/app/components/PopularesView"

import type { Flower, Member } from "@/app/lib/types"
import Divider from "@/app/components/Divider"

export type StatModalType =
  | "flores" | "floristas" | "ur" | "ssr"
  | "unicas" | "colecao" | "sem_dono" | "missoes" | null

export type FullPage = "missoes" | "floristas" | "colecao" | "graficos" | null

const fullPageMeta: Record<NonNullable<FullPage>, { icon: string; label: string }> = {
  missoes:   { icon: "🎯", label: "Missões da Semana"  },
  floristas: { icon: "🧑‍🌾", label: "Floristas"          },
  colecao:   { icon: "🌸", label: "Coleção"             },
  graficos:  { icon: "📊", label: "Analytics da Guilda" },
}

interface DashboardProps {
  flowers: Flower[]
  members: Member[]
}

export default function Dashboard({ flowers, members }: DashboardProps) {
  const [fullPage, setFullPage]             = useState<FullPage>(null)
  const [search, setSearch]                 = useState("")
  const [selectedRarity, setSelectedRarity] = useState("ALL")
  const [selectedOrigin, setSelectedOrigin] = useState("ALL")
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [statModal, setStatModal]           = useState<StatModalType>(null)

  const origins = useMemo(() => {
    const set = new Set(flowers.map((f) => f.origin).filter(Boolean))
    return Array.from(set).sort()
  }, [flowers])

  const filteredFlowers = useMemo(() => {
    return flowers.filter((f) => {
      const matchRarity = selectedRarity === "ALL" || f.rarity === selectedRarity
      const matchOrigin = selectedOrigin === "ALL" || f.origin === selectedOrigin
      const q = search.toLowerCase()
      const matchSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.rarity.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q)
      return matchRarity && matchOrigin && matchSearch
    })
  }, [flowers, selectedRarity, selectedOrigin, search])

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return members
    return members.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.flowers.some((f) => f.toLowerCase().includes(q)) ||
      m.favorites.some((f) => f.toLowerCase().includes(q))
    )
  }, [members, search])

  function openFullPage(page: NonNullable<FullPage>) {
    setSearch("")
    setSelectedRarity("ALL")
    setSelectedOrigin("ALL")
    setFullPage(page)
  }

  function closeFullPage() {
    setFullPage(null)
    setSearch("")
  }

  // Modais compartilhados
  const modals = (
    <>
      <AnimatePresence>
        {selectedFlower && (
          <FlowerModal key="flower-modal" flower={selectedFlower} members={members} onClose={() => setSelectedFlower(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedMember && (
          <MemberModal key="member-modal" member={selectedMember} flowers={flowers} onClose={() => setSelectedMember(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {statModal && (
          <StatsModal key="stats-modal" type={statModal} flowers={flowers} members={members} onClose={() => setStatModal(null)} />
        )}
      </AnimatePresence>
    </>
  )

  // ── TELA CHEIA ──
  if (fullPage) {
    const meta = fullPageMeta[fullPage]
    const isColecao = fullPage === "colecao"
    const spotlight = isColecao && search.trim().length > 0 && filteredFlowers.length >= 1 && filteredFlowers.length <= 3

    return (
      <>
        <div style={{ background: "transparent", minHeight: "100vh" }}>
          {/* Header sticky */}
          <div style={{
            position: "sticky", top: 0, zIndex: 40,
            background: "rgba(255,248,251,0.90)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(200,160,190,0.18)",
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <button onClick={closeFullPage} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "white", border: "1px solid #f0dded",
              borderRadius: 999, padding: "6px 14px",
              fontSize: 13, fontWeight: 700, color: "#85667F",
              cursor: "pointer", flexShrink: 0,
              boxShadow: "0 1px 6px rgba(180,100,140,0.08)",
            }}>← Voltar</button>
            <h1 style={{ fontSize: 16, fontWeight: 900, color: "#3a2a3a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {meta.icon} {meta.label}
            </h1>
          </div>

          {/* Busca em todas as fullPages */}
          <div style={{ padding: "12px 12px 0" }}>
            <SearchBar
              search={search}
              setSearch={setSearch}
              placeholder={
                fullPage === "colecao"   ? "Pesquisar flor, raridade, origem..." :
                fullPage === "floristas" ? "Pesquisar florista..." :
                fullPage === "missoes"   ? "Pesquisar florista ou flor..." :
                "Pesquisar..."
              }
            />
          </div>

          {/* Filtros só na Coleção */}
          {isColecao && (
            <div style={{ padding: "10px 12px 0" }}>
              <Filters
                selectedRarity={selectedRarity} setSelectedRarity={setSelectedRarity}
                selectedOrigin={selectedOrigin} setSelectedOrigin={setSelectedOrigin}
                origins={origins}
              />
            </div>
          )}

          <motion.div
            className="main-container" style={{ paddingTop: 16, overflowX: "hidden" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {fullPage === "missoes" && (
              <MissoesView flowers={flowers} members={members} search={search}
                onSelectMember={setSelectedMember} onSelectFlower={setSelectedFlower} />
            )}
            {fullPage === "floristas" && (
              <FloristasView flowers={flowers} members={filteredMembers} onSelectMember={setSelectedMember} />
            )}
            {fullPage === "colecao" && (
              spotlight ? (
                <SpotlightSearch flowers={filteredFlowers} members={members} onSelect={setSelectedFlower} onSelectMember={setSelectedMember} />
              ) : filteredFlowers.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 44 }}>🔎</p>
                  <p style={{ marginTop: 12, fontWeight: 700, color: "#c4a8c4" }}>Nenhuma flor encontrada</p>
                </div>
              ) : (
                <div className="flower-grid">
                  {filteredFlowers.map((flower) => (
                    <FlowerCard key={flower.id} flower={flower} members={members}
                      totalMembers={members.length} onClick={() => setSelectedFlower(flower)} />
                  ))}
                </div>
              )
            )}
            {fullPage === "graficos" && (
              <AnalyticsView flowers={flowers} members={members} onStatClick={setStatModal} onSelectFlower={setSelectedFlower} />
            )}
          </motion.div>
        </div>
        {modals}
        <style>{styles}</style>
      </>
    )
  }

  // ── HOME ──
  return (
    <>
      <div style={{ background: "transparent", minHeight: "100vh" }}>
        <HeroHeader />

        <div className="main-container">

          {/* Busca */}
          <div style={{ padding: "20px 0 16px" }}>
            <SearchBar search={search} setSearch={setSearch} placeholder="Pesquisar flor, florista, raridade, origem..." />
          </div>

          {/* Navegação 2×2 (mobile) / 4×1 (desktop) */}
          <StatsGrid
            flowers={flowers} members={members}
            onStatClick={setStatModal} onOpenFullPage={openFullPage}
          />

          {/* Divisor */}
          <Divider src="/ornaments/divisor-folhas.png" opacity={0.55} />

          {/* KPIs da semana */}
          <div style={{ marginBottom: 24 }}>
            <WeeklySummary flowers={flowers} members={members} />
          </div>

          {/* Divisor */}
          <div className="divider-line" />

          {/* Ranking das flores em competição */}
          <div style={{ marginBottom: 24 }}>
            <CompetitionCarousel
              flowers={flowers}
              members={members}
              onSelect={setSelectedFlower}
            />
          </div>

          {/* Divisor */}
          <div className="divider-line" />

          {/* Conheça nossas floristas */}
          <FloristasShowcase
            members={members}
            onViewAll={() => openFullPage("floristas")}
            onSelectMember={setSelectedMember}
          />

          {/* Espaço final */}
          <div style={{ height: 32 }} />
        </div>
      </div>
      {modals}
      <style>{styles}</style>
    </>
  )
}

const styles = `
  .main-container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 0 14px 100px;
    overflow-x: hidden;
  }
  .flower-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 480px) {
    .main-container { padding: 0 20px 100px; }
    .flower-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  }
  @media (min-width: 768px) {
    .main-container { padding: 0 28px 120px; }
    .flower-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  }
  @media (min-width: 1024px) {
    .main-container { padding: 0 36px 120px; }
    .flower-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
  }
  @media (min-width: 1280px) { .flower-grid { grid-template-columns: repeat(6, 1fr); } }
  @media (min-width: 1600px) { .flower-grid { grid-template-columns: repeat(8, 1fr); } }
`