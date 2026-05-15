export const dynamic = "force-dynamic"

import { notion } from "@/app/lib/notion"
import Dashboard from "@/app/components/Dashboard"
import type { Flower, Member } from "@/app/lib/types"

/** Busca TODAS as páginas de uma database (paginação automática) */
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

/** Busca todos os IDs de uma relation paginada (Notion limita a 25 por padrão) */
async function getRelationIds(pageId: string, propertyId: string): Promise<string[]> {
  try {
    const ids: string[] = []
    let data: any = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    })

    while (true) {
      // Formato paginado
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

    // Formato direto (array simples)
    if (ids.length === 0 && Array.isArray(data.relation)) {
      return data.relation.map((r: any) => r.id)
    }

    return ids
  } catch {
    return []
  }
}

/** Remove emoji/espaço do início de uma string */
function stripEmoji(str: string) {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim() || str
}

async function getData(): Promise<{ flowers: Flower[]; members: Member[] }> {
  const [flowerPages, memberPages] = await Promise.all([
    queryAll(process.env.NOTION_FLOWERS_DB!),
    queryAll(process.env.NOTION_MEMBERS_DB!),
  ])

  // IDs das propriedades (pega do primeiro item para usar no retrieve)
  const firstFlower = flowerPages[0]
  const firstMember = memberPages[0]
  const quemTemPropId   = firstFlower?.properties["👑 Quem tem"]?.id
  const floresPropId    = firstMember?.properties["🌸 Flores que tem"]?.id
  const favsPropId      = firstMember?.properties["💎 Flores preferidas"]?.id

  // ── Flores: busca owners real via relation paginada ──
  const flowers: Flower[] = await Promise.all(
    flowerPages.map(async (page: any) => {
      const props = page.properties

      // owners: tenta pegar direto; se has_more, busca paginado
      let owners = props["👑 Quem tem"]?.relation?.length ?? 0
      if (props["👑 Quem tem"]?.has_more && quemTemPropId) {
        const ids = await getRelationIds(page.id, quemTemPropId)
        owners = ids.length
      }

      return {
        id: page.id,
        name: props["🌸 Nome da Flor"]?.title?.[0]?.plain_text || "Flor misteriosa",
        rarity: props["💗 Raridade"]?.select?.name || "💚 N",
        origin: props["🛒 Origem"]?.select?.name || "Desconhecida",
        points: props["⭐ Pontuação Base"]?.number || 0,
        owners,
        image:
          page.cover?.file?.url ||
          page.cover?.external?.url ||
          props["🖼️ Imagem"]?.files?.[0]?.file?.url ||
          props["🖼️ Imagem"]?.files?.[0]?.external?.url ||
          null,
      }
    })
  )

  // Mapa ID → nome da flor
  const flowerById: Record<string, string> = {}
  flowers.forEach((f) => { flowerById[f.id] = f.name })

  // ── Membros: busca relations paginadas ──
  const members: Member[] = await Promise.all(
    memberPages.map(async (page: any) => {
      const props = page.properties

      const cargoRaw  = props["🏷️ Cargo"]?.select?.name || "Membro"
      const statusRaw =
        props["⚔️ Status na competição"]?.select?.name ||
        props["⚔️ Status na competição"]?.status?.name ||
        "Offline"

      // Flores que tem
      let flowerIds: string[] = props["🌸 Flores que tem"]?.relation?.map((r: any) => r.id) ?? []
      if (props["🌸 Flores que tem"]?.has_more && floresPropId) {
        flowerIds = await getRelationIds(page.id, floresPropId)
      }

      // Flores preferidas
      let favIds: string[] = props["💎 Flores preferidas"]?.relation?.map((r: any) => r.id) ?? []
      if (props["💎 Flores preferidas"]?.has_more && favsPropId) {
        favIds = await getRelationIds(page.id, favsPropId)
      }

      return {
        id: page.id,
        name: props["🎮 Nick do jogo"]?.title?.[0]?.plain_text || "Florista",
        cargo:  stripEmoji(cargoRaw),
        status: stripEmoji(statusRaw),
        avatar:
          props["🖼️ Avatar"]?.files?.[0]?.file?.url ||
          props["🖼️ Avatar"]?.files?.[0]?.external?.url ||
          null,
        bio: props["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
        flowers:   flowerIds.map((id) => flowerById[id]).filter(Boolean) as string[],
        favorites: favIds.map((id)    => flowerById[id]).filter(Boolean) as string[],
      }
    })
  )

  return { flowers, members }
}

export default async function Home() {
  const { flowers, members } = await getData()
  return <Dashboard flowers={flowers} members={members} />
}