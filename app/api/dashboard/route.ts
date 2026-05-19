import { NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

export async function GET() {
  try {
    const [flowersRes, membersRes] = await Promise.allSettled([
      notion.databases.query({ database_id: process.env.NOTION_FLOWERS_DB! }),
      notion.databases.query({ database_id: process.env.NOTION_MEMBERS_DB! }),
    ])

    if (flowersRes.status === "rejected" || membersRes.status === "rejected") {
      throw new Error("Erro ao buscar dados do Notion")
    }

    const flowerById: Record<string, string> = {}

    const flowers = flowersRes.value.results.map((page: any) => {
      const f = {
        id: page.id,
        name:   page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text || "Flor misteriosa",
        rarity: page.properties["💗 Raridade"]?.select?.name || "💚 N",
        origin: page.properties["🛒 Origem"]?.select?.name || "Desconhecida",
        points: page.properties["⭐ Pontuação Base"]?.number || 0,
        owners: page.properties["👑 Quem tem"]?.relation?.length || 0,
        // ✅ Campo correto: 🖼️ Foto da Flor
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

    const members = membersRes.value.results.map((member: any) => {
      const flowerIds: string[] =
        member.properties["🌸 Flores que tem"]?.relation?.map((r: any) => r.id) || []

      // ✅ Campo correto: 🎖️ Flores para Competição
      const favoriteIds: string[] =
        member.properties["🎖️ Flores para Competição"]?.relation?.map((r: any) => r.id) || []

      const statusRaw =
        member.properties["⚔️ Status na competição"]?.select?.name ||
        member.properties["⚔️ Status na competição"]?.status?.name ||
        "Offline"

      const cargoRaw = member.properties["🏷️ Cargo"]?.select?.name || "Membro"

      const stripEmoji = (str: string) =>
        str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim() || str

      return {
        id:     member.id,
        name:   member.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text || "Florista",
        cargo:  stripEmoji(cargoRaw),
        status: stripEmoji(statusRaw),
        avatar:
          member.properties["🖼️ Avatar"]?.files?.[0]?.file?.url ||
          member.properties["🖼️ Avatar"]?.files?.[0]?.external?.url ||
          null,
        bio:       member.properties["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
        flowers:   flowerIds.map((id) => flowerById[id]).filter(Boolean),
        favorites: favoriteIds.map((id) => flowerById[id]).filter(Boolean),
      }
    })

    return NextResponse.json({ flowers, members })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar dados do Notion" },
      { status: 500 }
    )
  }
}