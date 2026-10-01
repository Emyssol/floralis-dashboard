"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

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
import FloristasShowcase from "@/app/components/FloristasShowcase"
import RareView from "@/app/components/RareView"
import PopularesView from "@/app/components/PopularesView"
import ProfileMenu from "@/app/components/ProfileMenu"
import MeuStatusCard from "@/app/components/MeuStatusCard"
import FocoDaSemanaCard from "@/app/components/FocoDaSemanaCard"
import OwnedFlowersModal from "@/app/components/OwnedFlowersModal"
import CompetitionFlowersModal from "@/app/components/CompetitionFlowersModal"
import ExtraPointsModal from "@/app/components/ExtraPointsModal"
import MissionProgressModal from "@/app/components/MissionProgressModal"
import MiniFlowerCard from "@/app/components/MiniFlowerCard"
import InfoTooltip from "@/app/components/InfoTooltip"
import Toast from "@/app/components/Toast"
import { useToast } from "@/app/lib/useToast"
import { getMissoesMax } from "@/app/lib/missoesMax"

import type { Flower, Member } from "@/app/lib/types"
import Divider from "@/app/components/Divider"
import { LoginButton } from "@/app/components/LoginButton"

// Lê o deep-link "?flor=..." (ex.: vindo do widget Foco da Semana) e abre
// Missões já filtrado por aquela flor. useSearchParams exige um Suspense
// boundary — componente isolado só pra isso, sem render visível.
function DeepLinkFlorParam({ onFlorParam }: { onFlorParam: (flowerName: string) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const flor = searchParams.get("flor")
  const consumedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!flor || consumedRef.current === flor) return
    consumedRef.current = flor
    onFlorParam(flor)
    router.replace(pathname, { scroll: false })
  }, [flor, onFlorParam, pathname, router])

  return null
}

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
  floristas:      { icon: "🧑‍🌾", label: "Matriz"                   },
  colecao:        { icon: "🌸", label: "Coleção"                    },
  graficos:       { icon: "📊", label: "Analytics da Guilda"        },
  "floralis-baby":{ icon: "🌱", label: "Baby"                       },
}

// Copy do InfoTooltip do cabeçalho de cada tela em tela cheia. Missões tem o
// próprio tooltip (junto do título interno do MissoesView), por isso não
// entra aqui; Analytics não tem tooltip pedido.
const sectionInfoText: Partial<Record<NonNullable<FullPage>, string>> = {
  colecao: "Todas as flores do jogo. Ative o modo de seleção pra marcar em lote quais você já tem.",
  floristas: "Lista de floristas dessa guilda, com quantas flores cada uma já tem.",
  "floralis-baby": "Lista de floristas dessa guilda, com quantas flores cada uma já tem.",
}

interface DashboardProps {
  flowers: Flower[]
  members: Member[]
  missoesConcluidas?: string[]
  missoesProgresso?: Record<string, number>
  pontosExtra?: Record<string, Record<string, number>>
  onFlowerOwned?: (flowerId: string, floristaId: string) => void
  onFlowerUnowned?: (flowerId: string, floristaId: string) => void
  onFlowerCompetitionChange?: (floristaId: string, favoriteNames: string[]) => void
  onMissoesProgressoChange?: (floristaId: string, progresso: number) => void
  onPontosExtraChange?: (floristaId: string, flowerName: string, pontos: number | null) => void
}

export default function Dashboard({ flowers, members, missoesConcluidas = [], missoesProgresso = {}, pontosExtra = {}, onFlowerOwned, onFlowerUnowned, onFlowerCompetitionChange, onMissoesProgressoChange, onPontosExtraChange }: DashboardProps) {
  const [fullPage, setFullPage]             = useState<FullPage>(null)
  const [search, setSearch]                 = useState("")
  const [selectedRarity, setSelectedRarity] = useState("ALL")
  const [selectedOrigin, setSelectedOrigin] = useState("ALL")
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [statModal, setStatModal]           = useState<StatModalType>(null)
  const [activeSelfModal, setActiveSelfModal] = useState<"owned" | "competition" | "pontos" | "progresso" | null>(null)
  const [incrementingMissao, setIncrementingMissao] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  // Qual guilda o Analytics deve mostrar — decidido por qual link "Ver
  // analytics desta guilda" a florista clicou (Matriz ou Baby), não por
  // toggle: cada guilda tem seu próprio ponto de entrada agora.
  const [analyticsGuild, setAnalyticsGuild] = useState<"matriz" | "baby">("matriz")
  const [pendingFlowerId, setPendingFlowerId] = useState<string | null>(null)
  const { toast: colecaoToast, showToast: showColecaoToast } = useToast()

  const { data: session } = useSession()
  const router   = useRouter()
  const pathname = usePathname()

  // Florista correspondente à sessão atual — base do hub de ações pessoais
  // (ProfileMenu / MeuStatusCard), disponível em qualquer tela do app.
  const me = useMemo(
    () => members.find((m) => m.id === session?.user?.id) ?? null,
    [members, session?.user?.id]
  )
  const myProgresso = me ? (missoesProgresso[me.id] ?? 0) : 0
  // Teto de missões da própria guilda — 24 na Matriz, 18 na Baby.
  const myMissoesMax = getMissoesMax(me?.guild)

  // Botão "+1 missão" do MeuStatusCard — incremento relativo direto, sem
  // abrir o MissionProgressModal. Mesmo endpoint (delta), aceita 0 até o
  // teto da guilda dela.
  async function handleIncrementMissao() {
    if (!me || incrementingMissao || myProgresso >= myMissoesMax) return
    setIncrementingMissao(true)
    try {
      const res = await fetch("/api/floristas/concluir-missoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ florista_id: me.id, delta: 1 }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        onMissoesProgressoChange?.(me.id, data?.progresso ?? myProgresso + 1)
      }
    } catch (error) {
      console.error("[MeuStatusCard] Erro ao incrementar missão:", error)
    } finally {
      setIncrementingMissao(false)
    }
  }

  // Clique no widget "Foco da Semana" — abre Missões já filtrado por aquela
  // flor. Atualiza a URL (?flor=...) pra ficar compartilhável/deep-linkável,
  // mas não depende dela: o filtro já é aplicado direto aqui.
  function handleFocusFlower(flowerName: string) {
    openFullPage("missoes")
    setSearch(flowerName)
    try {
      router.push(`${pathname}?flor=${encodeURIComponent(flowerName)}`, { scroll: false })
    } catch { /* navegação é só um bônus de compartilhamento — não crítica */ }
  }

  // Mesma ação, mas disparada ao consumir o "?flor=" já presente na URL
  // (entrada direta por link).
  function handleDeepLinkFlor(flowerName: string) {
    openFullPage("missoes")
    setSearch(flowerName)
  }

  // Modo de seleção da Coleção — clique no card alterna posse da própria
  // conta logada, mesma rota/lógica do toggle em OwnedFlowersModal (aqui
  // duplicada de propósito: são dois pontos de entrada pro mesmo endpoint,
  // sem depender do modal estar aberto).
  async function handleToggleOwnFlower(flower: Flower) {
    if (!me || pendingFlowerId) return
    const isOwned = me.flowers.includes(flower.name)
    setPendingFlowerId(flower.id)
    try {
      const res = await fetch("/api/flores/marcar-posse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flower_id: flower.id,
          florista_id: me.id,
          ...(isOwned ? { remover: true } : {}),
        }),
      })
      if (!res.ok) throw new Error("Erro")
      const data = await res.json().catch(() => null)
      if (isOwned) {
        onFlowerUnowned?.(flower.id, me.id)
        showColecaoToast("Desmarcada", "neutral")
      } else if (data?.alreadyHad === false) {
        onFlowerOwned?.(flower.id, me.id)
        showColecaoToast("✓ Marcada", "success")
      }
    } catch (error) {
      console.error("[Coleção] Erro ao marcar/desmarcar posse:", error)
    } finally {
      setPendingFlowerId(null)
    }
  }

  // Sempre pega a versão mais atual da flor (reflete atualização otimista de "Quem tem")
  const liveSelectedFlower = useMemo(() => {
    if (!selectedFlower) return null
    return flowers.find((f) => f.id === selectedFlower.id) ?? selectedFlower
  }, [selectedFlower, flowers])

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
    setSelectionMode(false)
  }

  // Modais compartilhados (usados em todas as telas)
  // FlowerModal mostra "Quem tem" / "Flor preferida de" — escopado por guilda atual
  const flowerModalMembers = fullPage === "floralis-baby" ? babyMembers : floralisMembers

  const modals = (
    <>
      <Suspense fallback={null}>
        <DeepLinkFlorParam onFlorParam={handleDeepLinkFlor} />
      </Suspense>
      <AnimatePresence>
        {liveSelectedFlower && (
          <FlowerModal key="flower-modal" flower={liveSelectedFlower} members={flowerModalMembers} allMembers={members} missoesConcluidas={missoesConcluidas} pontosExtra={pontosExtra} onClose={() => setSelectedFlower(null)} onFlowerOwned={onFlowerOwned} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedMember && (
          <MemberModal
            key="member-modal" member={selectedMember} flowers={flowers} missoesConcluidas={missoesConcluidas} missoesProgresso={missoesProgresso} pontosExtra={pontosExtra}
            onMissoesConcluidasChange={(fid, concluiu) => onMissoesProgressoChange?.(fid, concluiu ? 24 : 0)}
            onPontosExtraChange={onPontosExtraChange}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {statModal && (
          <StatsModal key="stats-modal" type={statModal} flowers={flowers} members={members} onClose={() => setStatModal(null)} />
        )}
      </AnimatePresence>

      {/* Hub de ações pessoais — mesmos 3 modais, acionados pelo ProfileMenu
          (header) e pelo MeuStatusCard (Home). */}
      <AnimatePresence>
        {activeSelfModal === "owned" && me && (
          <OwnedFlowersModal
            key="owned-modal" member={me} flowers={flowers}
            onFlowerOwned={(fid, pid) => onFlowerOwned?.(fid, pid)}
            onFlowerUnowned={(fid, pid) => onFlowerUnowned?.(fid, pid)}
            onClose={() => setActiveSelfModal(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeSelfModal === "competition" && me && (
          <CompetitionFlowersModal
            key="competition-modal" member={me} flowers={flowers} pontosExtra={pontosExtra}
            onFlowerCompetitionChange={(fid, favs) => onFlowerCompetitionChange?.(fid, favs)}
            onClose={() => setActiveSelfModal(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeSelfModal === "pontos" && me && (
          <ExtraPointsModal
            key="pontos-modal" member={me} flowers={flowers} pontosExtra={pontosExtra}
            onPontosExtraChange={(fid, name, pontos) => onPontosExtraChange?.(fid, name, pontos)}
            onClose={() => setActiveSelfModal(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeSelfModal === "progresso" && me && (
          <MissionProgressModal
            key="progresso-modal" floristaId={me.id} progresso={myProgresso} max={myMissoesMax}
            onProgressoChange={(fid, p) => onMissoesProgressoChange?.(fid, p)}
            onClose={() => setActiveSelfModal(null)}
          />
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <h1 style={{
                fontSize: 16, fontWeight: 900,
                color: babyAccent ? "#3a6040" : "#3a2a3a",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {meta.icon} {meta.label}
              </h1>
              {sectionInfoText[fullPage] && <InfoTooltip text={sectionInfoText[fullPage]!} />}
            </div>

            {/* Chip identificador da guilda nas páginas específicas — Missões
                não entra aqui porque agora tem o próprio GuildToggle. Em
                Analytics, a guilda mostrada depende de qual link "Ver
                analytics desta guilda" trouxe a florista até aqui. */}
            {(fullPage === "floristas" || (fullPage === "graficos" && analyticsGuild === "matriz")) && (
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
            {(isBabyPage || (fullPage === "graficos" && analyticsGuild === "baby")) && (
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

          {/* Barra de busca — Floralis Baby usa GlobalSearch interna.
              Em Missões fica sticky (empilha com o header, mesmo "top") e
              recebe auto-focus ao entrar na tela. */}
          {fullPage !== "floralis-baby" && (
            <div style={{
              padding: "12px 12px 0",
              ...(fullPage === "missoes" ? {
                position: "sticky" as const, top: 0, zIndex: 39,
                background: "rgba(255,248,251,0.90)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              } : {}),
            }}>
              <SearchBar
                id="floralis-search-input"
                autoFocus={fullPage === "missoes"}
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
              {me && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectionMode((v) => !v)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: selectionMode ? "linear-gradient(135deg, #d4608a, #9B4FD4)" : "white",
                        color: selectionMode ? "white" : "#85667F",
                        border: selectionMode ? "none" : "1px solid #f0dded",
                        borderRadius: 999, padding: "6px 14px",
                        fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                        boxShadow: selectionMode ? "0 2px 10px rgba(212,96,138,0.22)" : "none",
                      }}
                    >
                      {selectionMode ? "✕ Sair do modo de seleção" : "🌸 Marcar minhas flores"}
                    </button>
                    <Toast toast={colecaoToast} />
                  </div>
                  {selectionMode && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#85667F" }}>
                      {me.flowers.length} de {flowers.length} flores · toque numa flor pra marcar ou desmarcar que você tem
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <motion.div
            className="main-container" style={{ paddingTop: 16, overflowX: "hidden" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* ── Missões: roster completo — o GuildToggle interno escolhe Matriz/Baby ── */}
            {fullPage === "missoes" && (
              <MissoesView
                flowers={flowers}
                members={members}
                missoesConcluidas={missoesConcluidas}
                pontosExtra={pontosExtra}
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
                onOpenAnalytics={() => { setAnalyticsGuild("matriz"); openFullPage("graficos") }}
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
                    selectionMode && me ? (
                      <MiniFlowerCard
                        key={flower.id}
                        flower={flower}
                        selected={me.flowers.includes(flower.name)}
                        loading={pendingFlowerId === flower.id}
                        onClick={() => handleToggleOwnFlower(flower)}
                      />
                    ) : (
                      <FlowerCard key={flower.id} flower={flower} members={members}
                        totalMembers={members.length} onClick={() => setSelectedFlower(flower)} />
                    )
                  ))}
                </div>
              )
            )}

            {/* ── Analytics: escopado pra guilda de onde veio o link ("Ver
                analytics desta guilda", na Matriz ou na Baby) ── */}
            {fullPage === "graficos" && (
              <AnalyticsView
                flowers={flowers}
                members={analyticsGuild === "baby" ? babyMembers : floralisMembers}
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
                onOpenAnalytics={() => { setAnalyticsGuild("baby"); openFullPage("graficos") }}
              />
            )}
          </motion.div>
        </div>
        {modals}
        <LoginButton />
        <ProfileMenu
          me={me} onOpenProgressModal={() => setActiveSelfModal("progresso")}
          onOpenOwned={() => setActiveSelfModal("owned")}
          onOpenCompetition={() => setActiveSelfModal("competition")}
          onOpenPontos={() => setActiveSelfModal("pontos")}
        />
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
              placeholder="Busque rapidamente: missões, quem faz, flor ou florista..."
              onSelectFlower={setSelectedFlower}
              onSelectMember={setSelectedMember}
              onViewAllFlowers={() => openFullPage("colecao")}
              onViewAllMembers={() => openFullPage("floristas")}
              onViewAllMissions={() => openFullPage("missoes")}
            />
          </div>

          {/* Status pessoal + foco da semana — só quando logada e reconhecida
              como florista; ambos ficam ocultos, sem quebrar o layout, caso
              contrário. */}
          <MeuStatusCard
            me={me} progresso={myProgresso} max={myMissoesMax} incrementing={incrementingMissao}
            onIncrementMissao={handleIncrementMissao}
            onOpenProgressModal={() => setActiveSelfModal("progresso")}
            onOpenOwned={() => setActiveSelfModal("owned")}
            onOpenCompetition={() => setActiveSelfModal("competition")}
          />
          <FocoDaSemanaCard
            flowers={flowers} members={members}
            missoesConcluidas={missoesConcluidas} missoesProgresso={missoesProgresso} pontosExtra={pontosExtra}
            onFocusFlower={handleFocusFlower}
          />

          {/* Navegação 2×2 (mobile) / 5×1 (desktop) */}
          <StatsGrid
            flowers={flowers} members={members}
            onStatClick={setStatModal} onOpenFullPage={openFullPage}
          />

          <Divider src="/ornaments/divisor-folhas.png" />

          {/* "Em missão"/"Em competição" saíram daqui — redundantes com o
              subtítulo do FocoDaSemanaCard, e cross-guild (contavam diferente
              do que ele já mostra por Matriz/Baby). Analytics também saiu —
              agora é um link em cada página de guilda ("Ver analytics desta
              guilda"), escopado por guilda de verdade em vez de um card
              sempre-Floralis solto na Home. Sem esses três, a Florapédia fica
              como o destaque único desse trecho da página. */}

          {/* 📖 Florapédia — banner link para Notion */}
          <a
            href="https://regular-swim-966.notion.site/FLORAP-DIA-383210e177188055b455d5796ab5b24e"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", textDecoration: "none", marginBottom: 8 }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 18,
              background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(246,230,188,0.18) 100%)",
              border: "1.5px solid rgba(246,230,188,0.55)",
              borderRadius: 22,
              padding: "22px 26px",
              boxShadow: "0 3px 18px rgba(200,160,80,0.10)",
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
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(246,230,188,0.55), rgba(200,160,80,0.18))",
                border: "1px solid rgba(246,230,188,0.70)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>📖</div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#4D3750", letterSpacing: "-0.01em" }}>
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
                <p style={{ fontSize: 13, fontWeight: 500, color: "#85667F", margin: 0, lineHeight: 1.45 }}>
                  Guia completo de flores, dicas e tutoriais da guilda
                </p>
              </div>

              {/* Seta */}
              <div style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 999,
                background: "rgba(200,160,80,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </div>
            </div>
          </a>

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
      <LoginButton />
      <ProfileMenu
        me={me} onOpenProgressModal={() => setActiveSelfModal("progresso")}
        onOpenOwned={() => setActiveSelfModal("owned")}
        onOpenCompetition={() => setActiveSelfModal("competition")}
        onOpenPontos={() => setActiveSelfModal("pontos")}
      />
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