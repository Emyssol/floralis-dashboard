export const dynamic = "force-dynamic"

import { notion } from "@/app/lib/notion"
import { proxyImage } from "@/app/lib/imageProxy"
import Dashboard from "@/app/components/Dashboard"
import type { Flower, Member } from "@/app/lib/types"

async function queryAll(database_id: string) {
  const results: any[] = []
  let cursor: string | undefined = undefined
  do {
    const res: any = await notion.databases.query({
      database_id,
      start_cursor: cursor,
      page_size: 100,
    })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

async function getRelationIds(pageId: string, propertyId: string): Promise<string[]> {
  try {
    const ids: string[] = []
    let data: any = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    })
    while (true) {
      const items: any[] = data.results ?? []
      for (const item of items) {
        const id = item?.relation?.id ?? item?.id
        if (id) ids.push(id)
      }
      if (data.has_more && data.next_cursor) {
        data = await (notion.pages.properties.retrieve as any)({
          page_id: pageId,
          property_id: propertyId,
          start_cursor: data.next_cursor,
        })
      } else break
    }
    if (ids.length === 0 && Array.isArray(data.relation)) {
      return data.relation.map((r: any) => r.id)
    }
    return ids
  } catch {
    return []
  }
}

function stripEmoji(str: string) {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim() || str
}

async function getData(): Promise<{ flowers: Flower[]; members: Member[] }> {
  const [flowerPages, memberPages] = await Promise.all([
    queryAll(process.env.NOTION_FLOWERS_DB!),
    queryAll(process.env.NOTION_MEMBERS_DB!),
  ])

  const firstFlower = flowerPages[0]
  const firstMember = memberPages[0]
  const quemTemPropId   = firstFlower?.properties["👑 Quem tem"]?.id
  const floresPropId    = firstMember?.properties["🌸 Flores que tem"]?.id
  // ── Campo de competição: tenta variações do nome para garantir compatibilidade ──
  // Busca a chave real do campo independente do emoji exato
  function findCompProp(props: any): any {
    const candidates = [
      "🎖️ Flores para Competição",
      "🌿 Flores para Competição",
      "🌱 Flores para Competição",
      "💎 Flores preferidas",
    ]
    for (const key of candidates) {
      if (props[key]) return { key, prop: props[key] }
    }
    for (const [key, val] of Object.entries(props)) {
      if (
        (key.includes("Competi") || key.includes("preferida")) &&
        (val as any).type === "relation"
      ) {
        return { key, prop: val }
      }
    }
    return null
  }

  const compPropId = (() => {
    const found = firstMember ? findCompProp(firstMember.properties) : null
    return found?.prop?.id ?? null
  })()

  // ── Flores ──
  const flowers: Flower[] = await Promise.all(
    flowerPages.map(async (page: any) => {
      const props = page.properties

      let owners = props["👑 Quem tem"]?.relation?.length ?? 0
      if (props["👑 Quem tem"]?.has_more && quemTemPropId) {
        const ids = await getRelationIds(page.id, quemTemPropId)
        owners = ids.length
      }

      return {
        id: page.id,
        name:   props["🌸 Nome da Flor"]?.title?.[0]?.plain_text || "Flor misteriosa",
        rarity: props["💗 Raridade"]?.select?.name || "💚 N",
        origin: props["🛒 Origem"]?.select?.name || "Desconhecida",
        points: props["⭐ Pontuação Base"]?.number || 0,
        owners,
        image: proxyImage(
          props["🖼️ Foto da Flor"]?.files?.[0]?.file?.url ||
          props["🖼️ Foto da Flor"]?.files?.[0]?.external?.url ||
          page.cover?.file?.url ||
          page.cover?.external?.url ||
          null
        ),
      }
    })
  )

  const flowerById: Record<string, string> = {}
  flowers.forEach((f) => { flowerById[f.id] = f.name })

  // Processa membros em lotes de 5 para evitar timeout
  const BATCH = 5
  const members: Member[] = []
  for (let i = 0; i < memberPages.length; i += BATCH) {
    const batch = memberPages.slice(i, i + BATCH)
    const results = await Promise.all(
      batch.map(async (page: any) => {
      const props = page.properties

      const cargoRaw  = props["🏷️ Cargo"]?.select?.name || "Membro"
      const statusRaw =
        props["⚔️ Status na competição"]?.select?.name ||
        props["⚔️ Status na competição"]?.status?.name ||
        "Fora"

      // Flores que tem
      let flowerIds: string[] = props["🌸 Flores que tem"]?.relation?.map((r: any) => r.id) ?? []
      if (props["🌸 Flores que tem"]?.has_more && floresPropId) {
        flowerIds = await getRelationIds(page.id, floresPropId)
      }

      // 🌿 Flores para Competição — busca flexível independente do emoji exato
      const compFound = findCompProp(props)
      let compIds: string[] = compFound?.prop?.relation?.map((r: any) => r.id) ?? []
      if (compFound?.prop?.has_more && compPropId) {
        compIds = await getRelationIds(page.id, compPropId)
      }

      return {
        id:     page.id,
        name:   props["🎮 Nick do jogo"]?.title?.[0]?.plain_text || "Florista",
        cargo:  stripEmoji(cargoRaw),
        status: stripEmoji(statusRaw),
        avatar: proxyImage(
          props["🖼️ Avatar"]?.files?.[0]?.file?.url ||
          props["🖼️ Avatar"]?.files?.[0]?.external?.url ||
          null
        ),
        bio:       props["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
        flowers:   flowerIds.map((id) => flowerById[id]).filter(Boolean) as string[],
        // favorites agora mapeia Flores para Competição
        favorites: compIds.map((id) => flowerById[id]).filter(Boolean) as string[],
      }
    })
    )
    members.push(...results)
  }

  return { flowers, members }
}

export default async function Home() {
  const { flowers, members } = await getData()
  return <Dashboard flowers={flowers} members={members} />
}