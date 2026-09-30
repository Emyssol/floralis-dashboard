import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"
import { redis, MISSOES_CONCLUIDAS_KEY } from "@/app/lib/redis"
import { getMissoesMax } from "@/app/lib/missoesMax"

// "⚔️ Status na competição" é um select (confirmado via databases.retrieve).
// Os nomes das opções TÊM o emoji — escrever "Concluiu" puro criaria uma opção
// nova no Notion, então usamos os rótulos exatos que já existem lá.
const PROP_STATUS_COMPETICAO = "⚔️ Status na competição"
const STATUS_CONCLUIU  = "✅ Concluiu"
const STATUS_EM_MISSAO = "🟢 Em Missão"
const PROP_GUILDA = "🎖️ Guilda"

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(n)))
}

// ── POST — atualiza o progresso semanal de missões de uma florista ──
// Teto por guilda (Matriz 24 / Baby 18, ver app/lib/missoesMax.ts) — não é
// mais um número fixo. Aceita `progresso` (valor absoluto) OU `delta`
// (incremento/decremento relativo, ex. o botão "+1 missão"). Sempre
// clampado no teto da guilda da PRÓPRIA florista dona do progresso — nunca
// sai do intervalo, mesmo que o delta empurre pra fora.
//
// `allowDecrease` (default true) controla se essa chamada pode BAIXAR o
// progresso abaixo do valor já salvo. O MissionProgressModal (correção
// deliberada, com -/+ e slider) manda true/omite. O toggle binário do
// MemberModal ("Concluí"/"Ainda estou fazendo") manda false, porque esquece
// o valor anterior — sem essa trava, "Ainda estou fazendo" apagaria
// progresso real (ex. 18 → 0) sem intenção.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { florista_id, progresso, delta, allowDecrease } = await request.json()

    if (!florista_id) {
      return NextResponse.json({ error: "Campo obrigatório: florista_id" }, { status: 400 })
    }
    if (progresso === undefined && delta === undefined) {
      return NextResponse.json(
        { error: "Informe progresso (valor absoluto) ou delta (incremento relativo)" },
        { status: 400 }
      )
    }

    // Só a própria florista — ou uma admin — pode alterar esse estado
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)
    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para alterar as missões dessa florista" },
        { status: 403 }
      )
    }

    // Teto de missões da guilda DA FLORISTA DONA DO PROGRESSO (não de quem
    // está chamando). Na própria conta, já vem no token de sessão — evita
    // uma consulta extra ao Notion no caminho comum. Só busca no Notion
    // quando é uma admin editando em nome de outra florista.
    let floristaGuild: string | null = isSelf ? (session.user.guild ?? null) : null
    if (!isSelf) {
      try {
        const page: any = await notion.pages.retrieve({ page_id: florista_id })
        floristaGuild = page.properties?.[PROP_GUILDA]?.select?.name ?? null
      } catch (error: any) {
        console.error("[API Concluir Missões] Falha ao ler guilda da florista, usando teto padrão:", error?.message)
      }
    }
    const progressoMax = getMissoesMax(floristaGuild)

    const atualRaw = await redis.hget(MISSOES_CONCLUIDAS_KEY, florista_id)
    const atual = Number(atualRaw) || 0

    let next: number
    if (progresso !== undefined) {
      if (typeof progresso !== "number" || !Number.isFinite(progresso)) {
        return NextResponse.json({ error: "progresso deve ser um número" }, { status: 400 })
      }
      next = clamp(progresso, progressoMax)
    } else {
      if (typeof delta !== "number" || !Number.isFinite(delta)) {
        return NextResponse.json({ error: "delta deve ser um número" }, { status: 400 })
      }
      next = clamp(atual + delta, progressoMax)
    }

    // Trava de redução — só quando explicitamente desligada (MemberModal)
    if (allowDecrease === false && next < atual) {
      next = atual
    }

    await redis.hset(MISSOES_CONCLUIDAS_KEY, { [florista_id]: next })

    // Espelha o estado no Notion ("⚔️ Status na competição"). Fica num try/catch
    // próprio: se o Redis foi atualizado mas o Notion falhar (rede etc.), loga e
    // ainda responde sucesso — não trava a florista por uma falha pontual, mesmo
    // que os dois sistemas fiquem dessincronizados até a próxima ação.
    try {
      await notion.pages.update({
        page_id: florista_id,
        properties: {
          [PROP_STATUS_COMPETICAO]: {
            select: { name: next >= progressoMax ? STATUS_CONCLUIU : STATUS_EM_MISSAO },
          },
        },
      })
    } catch (notionError: any) {
      console.error(
        "[API Concluir Missões] Redis OK, mas falhou ao atualizar o Notion:",
        notionError?.message
      )
    }

    return NextResponse.json({ success: true, progresso: next, progressoMax })

  } catch (error: any) {
    console.error("[API Concluir Missões] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
