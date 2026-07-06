"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

import Header from "@/app/components/Header"
import HeroHeader from "@/app/components/HeroHeader"
import StatsGrid from "@/app/components/StatsGrid"
import SearchBar from "@/app/components/SearchBar"
import GlobalSearch from "@/app/components/GlobalSearch"
import Filters from "@/app/components/Filters"
import FlowerCard from "@/app/components/FlowerCard"
import FlowerModal from "@/app/components/FlowerModal"
import MemberModal from "@/app/components/MemberModal"
import StatsModal from "@/app/components/StatsModal"
import AnalyticsView from "@/app/components/AnalyticsView"
import FloristasView from "@/app/components/FloristasView"
import FloralisBabyView from "@/app/components/FloralisBabyView"
import MissoesView from "@/app/components/MissoesView"
import SpotlightSearch from "@/app/components/SpotlightSearch"
import WeeklySummary from "@/app/components/WeeklySummary"
import FloristasShowcase from "@/app/components/FloristasShowcase"
import CompetitionCarousel from "@/app/components/CompetitionCarousel"
import RareView from "@/app/components/RareView"
import PopularesView from "@/app/components/PopularesView"

import type { Flower, Member } from "@/app/lib/types"
import Divider from "@/app/components/Divider"

export type StatModalType =
  | "flores" | "floristas" | "ur" | "ssr"
  | "unicas" | "colecao" | "sem_dono" | "missoes" | null

export type FullPage =
  | "missoes"
  | "floristas"
  | "colecao"
  | "graficos"
  | "floralis-baby"
  | null

// Helpers para normalizar o campo guild
// Aceita qualquer variação: "Floralis Baby", "🧸 Floralis Baby", "🐻 Floralis Baby", etc.
function isBaby(m: Member): boolean {
  const g = (m.guild ?? "").toLowerCase()
  return g.includes("baby")
}
function isFloralis(m: Member): boolean {
  return !isBaby(m)
}

const fullPageMeta: Record<NonNullable<FullPage>, { icon: string; label: string }> = {
  missoes:        { icon: "🎯", label: "Missões da Semana"          },
  floristas:      { icon: "🧑‍🌾", label: "Floristas"                },
  colecao:        { icon: "🌸", label: "Coleção"                    },
  graficos:       { icon: "📊", label: "Analytics da Guilda"        },
  "floralis-baby":{ icon: "🌱", label: "Floralis Baby"              },
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

  // ── Membros filtrados por guilda ──
  const floralisMembers = useMemo(() => members.filter(isFloralis), [members])
  const babyMembers     = useMemo(() => members.filter(isBaby),     [members])

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

  // Membros filtrados da Floralis principal (para busca na página floristas)
  const filteredFloralisMembers = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return floralisMembers
    return floralisMembers.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.flowers.some((f) => f.toLowerCase().includes(q)) ||
      m.favorites.some((f) => f.toLowerCase().includes(q))
    )
  }, [floralisMembers, search])

  // Membros filtrados da Baby (para busca na página floralis-baby)
  const filteredBabyMembers = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return babyMembers
    return babyMembers.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.flowers.some((f) => f.toLowerCase().includes(q)) ||
      m.favorites.some((f) => f.toLowerCase().includes(q))
    )
  }, [babyMembers, search])

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

  // Modais compartilhados (usados em todas as telas)
  // FlowerModal mostra "Quem tem" / "Flor preferida de" — escopado por guilda atual
  const flowerModalMembers = fullPage === "floralis-baby" ? babyMembers : floralisMembers

  const modals = (
    <>
      <AnimatePresence>
        {selectedFlower && (
          <FlowerModal key="flower-modal" flower={selectedFlower} members={flowerModalMembers} allMembers={members} onClose={() => setSelectedFlower(null)} />
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
    const meta    = fullPageMeta[fullPage]
    const isColecao = fullPage === "colecao"
    const isBabyPage = fullPage === "floralis-baby"
    const spotlight = isColecao && search.trim().length > 0 && filteredFlowers.length >= 1 && filteredFlowers.length <= 3

    // Cor de destaque para a header da Floralis Baby
    const babyAccent = isBabyPage

    return (
      <>
        <div style={{ background: "transparent", minHeight: "100vh" }}>
          {/* Header sticky */}
          <div style={{
            position: "sticky", top: 0, zIndex: 40,
            background: babyAccent
              ? "rgba(240,255,245,0.92)"
              : "rgba(255,248,251,0.90)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: babyAccent
              ? "1px solid rgba(160,220,180,0.25)"
              : "1px solid rgba(200,160,190,0.18)",
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <button onClick={closeFullPage} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "white",
              border: babyAccent ? "1px solid rgba(160,220,180,0.35)" : "1px solid #f0dded",
              borderRadius: 999, padding: "6px 14px",
              fontSize: 13, fontWeight: 700,
              color: babyAccent ? "#4a8a5a" : "#85667F",
              cursor: "pointer", flexShrink: 0,
              boxShadow: "0 1px 6px rgba(180,100,140,0.08)",
            }}>← Voltar</button>
            <h1 style={{
              fontSize: 16, fontWeight: 900,
              color: babyAccent ? "#3a6040" : "#3a2a3a",
              margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {meta.icon} {meta.label}
            </h1>

            {/* Chip identificador da guilda nas páginas específicas */}
            {(fullPage === "floristas" || fullPage === "missoes" || fullPage === "graficos") && (
              <span style={{
                marginLeft: "auto", flexShrink: 0,
                background: "rgba(232,184,203,0.18)", color: "#C8849E",
                border: "1px solid rgba(232,184,203,0.35)",
                borderRadius: 999, padding: "3px 10px",
                fontSize: 10, fontWeight: 800,
              }}>
                🦋 Floralis
              </span>
            )}
            {isBabyPage && (
              <span style={{
                marginLeft: "auto", flexShrink: 0,
                background: "rgba(160,220,180,0.20)", color: "#4a8a5a",
                border: "1px solid rgba(160,220,180,0.38)",
                borderRadius: 999, padding: "3px 10px",
                fontSize: 10, fontWeight: 800,
              }}>
                🧸 Guilda Escola
              </span>
            )}
          </div>

          {/* Barra de busca — Floralis Baby usa GlobalSearch interna */}
          {fullPage !== "floralis-baby" && (
            <div style={{ padding: "12px 12px 0" }}>
              <SearchBar
                search={search}
                setSearch={setSearch}
                placeholder={
                  fullPage === "colecao"        ? "Pesquisar flor, raridade, origem..." :
                  fullPage === "floristas"       ? "Pesquisar florista..." :
                  fullPage === "missoes"         ? "Pesquisar florista ou flor..." :
                  "Pesquisar..."
                }
              />
            </div>
          )}

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
            {/* ── Missões: filtrado para Floralis principal ── */}
            {fullPage === "missoes" && (
              <MissoesView
                flowers={flowers}
                members={floralisMembers}
                search={search}
                onSelectMember={setSelectedMember}
                onSelectFlower={setSelectedFlower}
              />
            )}

            {/* ── Floristas: filtrado para Floralis principal ── */}
            {fullPage === "floristas" && (
              <FloristasView
                flowers={flowers}
                members={filteredFloralisMembers}
                onSelectMember={setSelectedMember}
              />
            )}

            {/* ── Coleção ── */}
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

            {/* ── Analytics: filtrado para Floralis principal ── */}
            {fullPage === "graficos" && (
              <AnalyticsView
                flowers={flowers}
                members={floralisMembers}
                onStatClick={setStatModal}
                onSelectFlower={setSelectedFlower}
              />
            )}

            {/* ── Floralis Baby ── */}
            {fullPage === "floralis-baby" && (
              <FloralisBabyView
                flowers={flowers}
                members={filteredBabyMembers}
                onSelectMember={setSelectedMember}
                onSelectFlower={setSelectedFlower}
              />
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

          {/* Busca global inteligente */}
          <div style={{ padding: "20px 0 16px" }}>
            <GlobalSearch
              flowers={flowers}
              members={floralisMembers}
              onSelectFlower={setSelectedFlower}
              onSelectMember={setSelectedMember}
              onViewAllFlowers={() => openFullPage("colecao")}
              onViewAllMembers={() => openFullPage("floristas")}
              onViewAllMissions={() => openFullPage("missoes")}
            />
          </div>

          {/* Navegação 2×2 (mobile) / 5×1 (desktop) */}
          <StatsGrid
            flowers={flowers} members={members}
            onStatClick={setStatModal} onOpenFullPage={openFullPage}
          />

          <Divider src="/ornaments/divisor-folhas.png" />

          {/* KPIs da semana — exclusivo Floralis (Baby tem seus próprios na página dela) */}
          <div style={{ marginBottom: 24 }}>
            <WeeklySummary flowers={flowers} members={floralisMembers} onOpenAnalytics={() => openFullPage("graficos")} />
          </div>

          <div className="divider-line" />

          {/* 📖 Florapédia — banner link para Notion */}
          <a
            href="https://regular-swim-966.notion.site/FLORAP-DIA-383210e177188055b455d5796ab5b24e"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", textDecoration: "none", marginBottom: 8 }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(246,230,188,0.18) 100%)",
              border: "1.5px solid rgba(246,230,188,0.55)",
              borderRadius: 20,
              padding: "16px 20px",
              boxShadow: "0 2px 14px rgba(200,160,80,0.08)",
              position: "relative", overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(200,160,80,0.14)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 14px rgba(200,160,80,0.08)" }}
            >
              {/* Brilho dourado decorativo */}
              <img src="/ornaments/brilho-dourado.png" alt="" aria-hidden style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "auto", opacity: 0.12, objectFit: "contain", objectPosition: "right center", pointerEvents: "none" }} />

              {/* Ícone */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(246,230,188,0.55), rgba(200,160,80,0.18))",
                border: "1px solid rgba(246,230,188,0.70)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>📖</div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#4D3750", letterSpacing: "-0.01em" }}>
                    Florapédia
                  </span>
                  {/* Badge Notion */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    background: "rgba(0,0,0,0.06)", borderRadius: 999,
                    padding: "1px 7px", fontSize: 9, fontWeight: 700, color: "#6B6B6B",
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>
                    Notion
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#85667F", margin: 0, lineHeight: 1.45 }}>
                  Guia completo de flores, dicas e tutoriais da guilda
                </p>
              </div>

              {/* Seta */}
              <div style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 999,
                background: "rgba(200,160,80,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </div>
            </div>
          </a>

          <div className="divider-line" />
          <div style={{ marginBottom: 24 }}>
            <CompetitionCarousel
              flowers={flowers}
              members={floralisMembers}
              onSelect={setSelectedFlower}
            />
          </div>

          <div className="divider-line" />

          {/* Nossas floristas — usa TODOS os membros (ambas as guildas) */}
          <FloristasShowcase
            members={members}
            onViewAll={() => openFullPage("floristas")}
            onSelectMember={setSelectedMember}
          />

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