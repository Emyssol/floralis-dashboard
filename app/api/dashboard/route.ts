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

    // Mapa ID → nome da flor
    const flowerById: Record<string, string> = {}
    const flowers = flowersRes.value.results.map((page: any) => {
      const f = {
        id: page.id,
        name:
          page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ||
          "Flor misteriosa",
        rarity: page.properties["💗 Raridade"]?.select?.name || "💚 N",
        origin: page.properties["🛒 Origem"]?.select?.name || "Desconhecida",
        points: page.properties["⭐ Pontuação Base"]?.number || 0,
        owners: page.properties["👑 Quem tem"]?.relation?.length || 0,
        image:
          page.cover?.file?.url ||
          page.cover?.external?.url ||
          page.properties["🖼️ Imagem"]?.files?.[0]?.file?.url ||
          page.properties["🖼️ Imagem"]?.files?.[0]?.external?.url ||
          null,
      }
      flowerById[f.id] = f.name
      return f
    })

    const members = membersRes.value.results.map((page: any) => {
      const flowerIds: string[] =
        page.properties["🌸 Flores que tem"]?.relation?.map((r: any) => r.id) || []
      const favoriteIds: string[] =
        page.properties["💎 Flores preferidas"]?.relation?.map((r: any) => r.id) || []

      const status =
        page.properties["⚔️ Status na competição"]?.select?.name ||
        page.properties["⚔️ Status na competição"]?.status?.name ||
        "Offline"

      const cargoRaw =
        page.properties["🏷️ Cargo"]?.select?.name || "Membro"
      const cargo = cargoRaw.replace(/^[\p{Emoji}\s]+/u, "").trim() || cargoRaw

      return {
        id: page.id,
        name:
          page.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text ||
          "Florista",
        cargo,
        status: status.replace(/^[\p{Emoji}\s]+/u, "").trim() || status,
        avatar:
          page.properties["🖼️ Avatar"]?.files?.[0]?.file?.url ||
          page.properties["🖼️ Avatar"]?.files?.[0]?.external?.url ||
          null,
        bio:
          page.properties["📝 Bio"]?.rich_text?.[0]?.plain_text || "",
        flowers: flowerIds.map((id) => flowerById[id]).filter(Boolean),
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