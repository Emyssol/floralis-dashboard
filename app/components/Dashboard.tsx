"use client"

import { useState, useMemo } from "react"
import { AnimatePresence } from "framer-motion"

import Header from "@/app/components/Header"
import StatsGrid from "@/app/components/StatsGrid"
import Tabs from "@/app/components/Tabs"
import SearchBar from "@/app/components/SearchBar"
import Filters from "@/app/components/Filters"
import FlowerCard from "@/app/components/FlowerCard"
import FlowerModal from "@/app/components/FlowerModal"
import MemberModal from "@/app/components/MemberModal"
import StatsModal from "@/app/components/StatsModal"
import RareView from "@/app/components/RareView"
import AnalyticsView from "@/app/components/AnalyticsView"
import PopularesView from "@/app/components/PopularesView"
import FloristasView from "@/app/components/FloristasView"
import MissoesView from "@/app/components/MissoesView"
import SpotlightSearch from "@/app/components/SpotlightSearch"

import type { Flower, Member } from "@/app/lib/types"

export type StatModalType =
  | "flores" | "floristas" | "ur" | "ssr"
  | "unicas" | "colecao" | "sem_dono" | "missoes" | null

interface DashboardProps {
  flowers: Flower[]
  members: Member[]
}

export default function Dashboard({ flowers, members }: DashboardProps) {
  const [activeTab, setActiveTab]           = useState("missoes")
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
      // Nome da florista
      m.name.toLowerCase().includes(q) ||
      // Tem uma flor com esse nome na coleção
      m.flowers.some((f) => f.toLowerCase().includes(q)) ||
      // Tem uma flor com esse nome na competição
      m.favorites.some((f) => f.toLowerCase().includes(q))
    )
  }, [members, search])

  const isSpotlight =
    activeTab === "colecao" &&
    search.trim().length > 0 &&
    filteredFlowers.length >= 1 &&
    filteredFlowers.length <= 3

  return (
    <>
      <div style={{ background: "#FFF9F2", minHeight: "100vh" }}>
        <Header />

        <div className="main-container">

          {/* ── Busca — espaço generoso acima e abaixo ── */}
          <div style={{ padding: "24px 0 16px" }}>
            <SearchBar
              search={search}
              setSearch={setSearch}
              placeholder="Pesquisar flor, florista, raridade, origem..."
            />
          </div>

          {/* ── Filtros — espaço abaixo ── */}
          <div style={{ paddingBottom: 20 }}>
            <Filters
              selectedRarity={selectedRarity}
              setSelectedRarity={setSelectedRarity}
              selectedOrigin={selectedOrigin}
              setSelectedOrigin={setSelectedOrigin}
              origins={origins}
            />
          </div>

          {/* ── Stats ── */}
          <div style={{ marginBottom: 24 }}>
            <StatsGrid flowers={flowers} members={members} onStatClick={setStatModal} onTabChange={setActiveTab} />
          </div>

          {/* ── Tabs ── */}
          <div style={{ marginBottom: 24 }}>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* ── Conteúdo ── */}
          {activeTab === "colecao" && (
            <>
              {isSpotlight ? (
                <SpotlightSearch
                  flowers={filteredFlowers}
                  members={members}
                  onSelect={setSelectedFlower}
                  onSelectMember={setSelectedMember}
                />
              ) : filteredFlowers.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 44 }}>🔎</p>
                  <p style={{ marginTop: 12, fontWeight: 700, color: "#c4a8c4" }}>
                    Nenhuma flor encontrada
                  </p>
                </div>
              ) : (
                <div className="flower-grid">
                  {filteredFlowers.map((flower) => (
                    <FlowerCard
                      key={flower.id}
                      flower={flower}
                      members={members}
                      totalMembers={members.length}
                      onClick={() => setSelectedFlower(flower)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "raras"     && <RareView flowers={flowers} onSelect={setSelectedFlower} />}
          {activeTab === "populares" && <PopularesView flowers={flowers} members={members} onSelect={setSelectedFlower} />}
          {activeTab === "graficos"  && <AnalyticsView flowers={flowers} members={members} onStatClick={setStatModal} onSelectFlower={setSelectedFlower} />}
          {activeTab === "missoes" && <MissoesView flowers={flowers} members={members} search={search} onSelectMember={setSelectedMember} onSelectFlower={setSelectedFlower} />
        }
        {activeTab === "floristas" && <FloristasView flowers={flowers} members={filteredMembers} onSelectMember={setSelectedMember} />}
        </div>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {selectedFlower && <FlowerModal key="flower-modal" flower={selectedFlower} members={members} onClose={() => setSelectedFlower(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedMember && <MemberModal key="member-modal" member={selectedMember} flowers={flowers} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {statModal && <StatsModal key="stats-modal" type={statModal} flowers={flowers} members={members} onClose={() => setStatModal(null)} />}
      </AnimatePresence>

      <style>{`
        .main-container {
          max-width: 1800px;
          margin: 0 auto;
          padding: 0 16px 80px;
        }
        .flower-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 480px) {
          .main-container { padding: 0 20px 80px; }
          .flower-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
        }
        @media (min-width: 768px) {
          .main-container { padding: 0 28px 100px; }
          .flower-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
        }
        @media (min-width: 1024px) {
          .main-container { padding: 0 32px 100px; }
          .flower-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }
        @media (min-width: 1280px) {
          .flower-grid { grid-template-columns: repeat(6, 1fr); }
        }
        @media (min-width: 1600px) {
          .flower-grid { grid-template-columns: repeat(8, 1fr); }
        }
      `}</style>
    </>
  )
}