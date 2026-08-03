import { notion } from "@/app/lib/notion"
import type { Flower, Member } from "@/app/lib/types"

const PROP_FLORES_QUE_TEM    = "py%3DC"
const PROP_FLORES_COMPETICAO = "J%5EvN"

// ── Cache em memória ──
let cache: { flowers: Flower[]; members: Member[]; ts: number } | null = null
const CACHE_TTL = 60 * 1000

async function queryAll(databaseId: string): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    })
    results.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)
  return results
}

async function getFullRelation(pageId: string, propertyId: string): Promise<string[]> {
  const ids: string[] = []
  let cursor: string | undefined
  do {
    const res = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
      start_cursor: cursor,
    } as any)
    if (res.object === "list") {
      for (const item of (res as any).results) {
        if (item.type === "relation") ids.push(item.relation.id)
      }
      cursor = (res as any).next_cursor ?? undefined
    } else { break }
  } while (cursor)
  return ids
}

async function resolveRelation(member: any, propName: string, propId: string): Promise<string[]> {
  const prop = member.properties[propName]
  if (!prop) return []
  if (prop.has_more) return await getFullRelation(member.id, propId)
  return prop.relation?.map((r: any) => r.id) || []
}

async function processInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }
  return results
}

export async function getDashboardData(forceRefresh = false): Promise<{ flowers: Flower[]; members: Member[] }> {
  // Servir do cache se válido
  if (!forceRefresh && cache && Date.now() - cache.ts < CACHE_TTL) {
    return { flowers: cache.flowers, members: cache.members }
  }

  const [flowersRes, membersRes] = await Promise.allSettled([
    queryAll(process.env.NOTION_FLOWERS_DB!),
    queryAll(process.env.NOTION_MEMBERS_DB!),
  ])

  if (flowersRes.status === "rejected" || membersRes.status === "rejected") {
    throw new Error("Erro ao buscar dados do Notion")
  }

  const flowerById: Record<string, string> = {}

  const flowers: Flower[] = flowersRes.value.map((page: any) => {
    const f = {
      id:       page.id,
      name:     page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text || "Flor misteriosa",
      rarity:   page.properties["💗 Raridade"]?.select?.name || "💚 N",
      origin:   page.properties["🛒 Origem"]?.select?.name || "Desconhecida",
      points:   page.properties["⭐ Pontuação Base"]?.number || 0,
      diamonds: page.properties["💎 Diamantes para Dobrar"]?.number || 0,
      owners:   page.properties["👑 Quem tem"]?.relation?.length || 0,
      image:
        page.properties["🖼️ Foto da Flor"]?.files?.[0]?.file?.url ||
        page.properties["🖼️ Foto da Flor"]?.files?.[0]?.external?.url ||
        page.cover?.file?.url ||
        page.cover?.external?.url ||
        null,
    }
    flowerById[f.id] = f.name
    return f
  })

  const stripEmoji = (str: string) =>
    str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim() || str

  const members: Member[] = await processInBatches(membersRes.value, 10, async (member: any) => {
    const [flowerIds, favoriteIds] = await Promise.all([
      resolveRelation(member, "🌸 Flores que tem",          PROP_FLORES_QUE_TEM),
      resolveRelation(member, "🎖️ Flores para Competição", PROP_FLORES_COMPETICAO),
    ])

    const statusRaw =
      member.properties["⚔️ Status na competição"]?.select?.name ||
      member.properties["⚔️ Status na competição"]?.status?.name ||
      "Offline"

    const cargoRaw = member.properties["🏷️ Cargo"]?.select?.name || "Membro"

    // Campo Guilda — nome real no Notion: "🎖️ Guilda"
    // Fallbacks para variações e busca dinâmica
    const guildRaw = (() => {
      // 1. Tenta chaves exatas conhecidas (mais específica primeiro)
      const exact =
        member.properties["🎖️ Guilda"]?.select?.name ||
        member.properties["🏠 Guilda"]?.select?.name ||
        member.properties["Guilda"]?.select?.name ||
        member.properties["🦋 Guilda"]?.select?.name ||
        member.properties["guilda"]?.select?.name

      if (exact) return exact

      // 2. Busca dinâmica: qualquer propriedade cujo nome contenha "uilda"
      const keys = Object.keys(member.properties)
      const key = keys.find((k) => k.toLowerCase().includes("uilda"))
      if (key) return member.properties[key]?.select?.name ?? null

      return null
    })() ?? "🦋 Floralis"

    return {
      id:         member.id,
      name:       member.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text || "Florista",
      cargo:      stripEmoji(cargoRaw),
      status:     stripEmoji(statusRaw),
      guild:      guildRaw,
      lastEdited: member.last_edited_time as string,
      birthday:   member.properties["🎂 Aniversário"]?.date?.start ?? null,
      avatar:
        member.properties["🖼️ Avatar"]?.files?.[0]?.file?.url ||
        member.properties["🖼️ Avatar"]?.files?.[0]?.external?.url ||
        null,
      bio:       member.properties["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
      gameId:    member.properties["ID de Jogador (a)"]?.number ?? null,
      flowers:   flowerIds.map((id) => flowerById[id]).filter(Boolean),
      favorites: favoriteIds.map((id) => flowerById[id]).filter(Boolean),
    }
  })

  // Salvar no cache
  cache = { flowers, members, ts: Date.now() }
  return { flowers, members }
}