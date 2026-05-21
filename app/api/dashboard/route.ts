import { NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

async function queryAll(databaseId: string): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    results.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)
  return results
}

const PROP_FLORES_QUE_TEM    = "py%3DC"  // 🌸 Flores que tem
const PROP_FLORES_COMPETICAO = "J%5EvN"  // 🎖️ Flores para Competição

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

export async function GET() {
  try {
    const [flowersRes, membersRes] = await Promise.allSettled([
      queryAll(process.env.NOTION_FLOWERS_DB!),
      queryAll(process.env.NOTION_MEMBERS_DB!),
    ])

    if (flowersRes.status === "rejected" || membersRes.status === "rejected") {
      throw new Error("Erro ao buscar dados do Notion")
    }

    const flowerById: Record<string, string> = {}

    const flowers = flowersRes.value.map((page: any) => {
      const f = {
        id:     page.id,
        name:   page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text || "Flor misteriosa",
        rarity: page.properties["💗 Raridade"]?.select?.name || "💚 N",
        origin: page.properties["🛒 Origem"]?.select?.name || "Desconhecida",
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

    const members = await Promise.all(
      membersRes.value.map(async (member: any) => {
        const [flowerIds, favoriteIds] = await Promise.all([
          resolveRelation(member, "🌸 Flores que tem",          PROP_FLORES_QUE_TEM),
          resolveRelation(member, "🎖️ Flores para Competição", PROP_FLORES_COMPETICAO),
        ])

        const statusRaw =
          member.properties["⚔️ Status na competição"]?.select?.name ||
          member.properties["⚔️ Status na competição"]?.status?.name ||
          "Offline"

        const cargoRaw = member.properties["🏷️ Cargo"]?.select?.name || "Membro"

        // 🎂 Data de aniversário — campo "🎂 Aniversário" (type: date)
        const birthdayRaw: string | null =
          member.properties["🎂 Aniversário"]?.date?.start ?? null

        return {
          id:          member.id,
          name:        member.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text || "Florista",
          cargo:       stripEmoji(cargoRaw),
          status:      stripEmoji(statusRaw),
          lastEdited:  member.last_edited_time as string,
          birthday:    birthdayRaw,   // "YYYY-MM-DD" ou null
          avatar:
            member.properties["🖼️ Avatar"]?.files?.[0]?.file?.url ||
            member.properties["🖼️ Avatar"]?.files?.[0]?.external?.url ||
            null,
          bio:       member.properties["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
          flowers:   flowerIds.map((id) => flowerById[id]).filter(Boolean),
          favorites: favoriteIds.map((id) => flowerById[id]).filter(Boolean),
        }
      })
    )

    return NextResponse.json({ flowers, members })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar dados do Notion" },
      { status: 500 }
    )
  }
}