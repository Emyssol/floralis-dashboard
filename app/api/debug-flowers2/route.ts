import { NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

export async function GET() {
  const results: any[] = []
  let cursor: string | undefined
  do {
    const res: any = await notion.databases.query({
      database_id: process.env.NOTION_FLOWERS_DB!,
      page_size: 100,
      start_cursor: cursor,
    })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  const buscar = [
    "flamingo", "white flamingo",
    "yellow dancing", "dancing lady",
    "yellow himalayan", "himalayan",
    "graça", "dragao", "dragon",
    "hora preguiçosa", "lazy",
    "primula rosa", "primula roxa", "baby primrose",
    "desejo estelar", "stellar",
    "flor da erupção", "sunflare",
    "petala iluminada", "sunlit",
    "zangao amarela", "bumble rose",
    "yellow green boat", "boat orchid",
    "bencao do leao", "golden lion",
    "fortuna do leao", "pink lion",
    "hora do cha", "easter teatime",
    "balanco das ondas", "wavelet",
    "hibisco esfumacado", "smokepink",
    "abyssal", "sonho", "onírico",
    "pequena primula"
  ]

  const todas = results.map((p: any) =>
    p.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ?? ""
  ).filter(Boolean).sort()

  const encontradas = todas.filter((nome: string) => {
    const lower = nome.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return buscar.some(b => {
      const bNorm = b.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return lower.includes(bNorm)
    })
  })

  return NextResponse.json({
    total: encontradas.length,
    flores: encontradas,
    // Também retorna todas para conferir
    todas_as_flores: todas,
  })
}