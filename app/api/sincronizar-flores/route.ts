import { NextRequest, NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

// Dados extraídos da planilha — flores SR/SSR/UR por florista
// Chave = nome como aparece no Notion (Nick do jogo)
const PLANILHA: Record<string, string[]> = {
  "Indi Flower's": ["Abismo de Peixes (Pisces-Abyss)","Galho-bruxo (Twigwhitch)","Moonlake Peony","Azure Coral Reef","Blue Evening Primrose","Blue Oleander","Coral Boat Orchid","Crimson Hollyhock","Golden Wintersweet","Lunar Wisteria (Glicínia Lunar)","Orange Bumble Rose (Rosa Zangão Laranja)","Orange Flaming Katy","Orange Star Orchid","Peach Calandiva","Peach Flamingo Flower","Pink Anemone","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Iron Chopstick Flower","Pink Lewisia","Pink Peony Dahlia","Pink Starry Pollenveil","Purple Baby Primrose (Pequena Prímula Roxa)","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","Sapphirebone Coral (Coral Osso de Safira)","Silver Osmanthus","Smokepink Hibiscus (Hibisco Esfumaçado)","Stellar Wish (Desejo Estelar)","Sunflare Bloom (Flor da Erupção Solar)","Sunlit Petal (Pétala Iluminada pelo Sol)","White Blue-Eyed Anemone","White Bunnycotton","White Flamingo Flower","White-Purple Clematis","Yellow Chinese Hibiscus (Hibisco Chinês Amarelo)","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Flower Cake Basket (Cesto de Bolo e Flores)","Merrycap (Capelo Alegre)","Peach Wintersweet","Pearl Magnolia"],
  "Nathy Marques": ["Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Golden Wintersweet","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Red Hollyhock","Red Winterberry","White Blue-Eyed Anemone","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Yesterday Today Tomorrow"],
  "Hope": ["Blue Evening Primrose","Crimson Hollyhock","Golden Wintersweet","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Red Hollyhock","Red Winterberry","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Champagne Gilded Rose","Orange Hibiscus Jewelry Box","White Morning Dew Lily"],
  "Sissi": ["Moonlake Peony","Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Golden Wintersweet","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Anemone","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Iceland Poppy","Purple Lilyturf","Purple Magnolia","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","Scarlet Iceland Poppy","Silver Cycad","Smokepink Hibiscus (Hibisco Esfumaçado)","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Yellow-Orange Iceland Poppy","Champagne Gilded Rose","Hazeglow Fan (Leque de Brilho Enevoado)","Heartbeat Berry (Fruta Palpitante)","Merrycak (Capelo Alegre)","Orange Hibiscus Jewelry Box","Pink Hibiscus Jewelry Box","Pink Lotus","Purple Hibiscus Jewelry Box","Yesterday Today Tomorrow"],
  "Emmy": ["Pluma de Anjo","Moonlake Peony","Blue Evening Primrose","Crimson Hollyhock","Lunar Wisteria (Glicínia Lunar)","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Snowflake (Floco de Neve Roxo)","Red Winterberry","Silver Cycad","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Apricot Lotus","Blue Jeweled Peony","Dream-Painted Eggs (Ovos pintados de Sonho)","Easter Teatime (Hora do Chá de Páscoa)","Egg Surprise (Ovo Surpresa)","Pearl Magnolia"],
  "Vânia": ["Galho-bruxo (Twigwhitch)","Pluma de Anjo","Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Golden Wintersweet","Lunar Wisteria (Glicínia Lunar)","Orange Dancing Lady Orchid","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)","Warm Gold Abode (Morada de Ouro Quente)"],
  "Lisa": ["Abismo de Peixes (Pisces-Abyss)","Dragon Grace (Graça do Dragão)","Forest Hart","Galho-bruxo (Twigwhitch)","Lazy Hour (Hora Preguiçosa)","Moonlake Peony","Pisces-Abyss (Abismo de Peixes)","Rastro de Áries","Azure Coral Reef","Azure Nemesia (Nemésia Azul-celeste)","Blue Celebration Rose","Blue Cornflower","Blue Evening Primrose","Blue Himalayan Poppy","Blue Oleander","Coral Boat Orchid","Crimson Dahlia","Crimson Hollyhock","Golden Bell Forsythia","Golden Wintersweet","Jade Snowflake (Floco de Neve de Jade)","Light Blue Astilbe","Light Blue Wisteria","Light Orange Verbena","Light Pink Verbena","Light Purple Astilbe","Lunar Wisteria (Glicínia Lunar)","Midnight Dahlia","Orange Dancing Lady Orchid","Orange Flaming Katy","Orange Sea Anemone","Orange Star Orchid","Peach Calandiva","Peach Flamingo Flower","Pink Anemone","Pink Amaryllis","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Celebration Rose","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Peony Dahlia","Pink Rhododendron","Pink Starry Pollenveil","Pink Wisteria","Purple Baby Primrose (Pequena Prímula Roxa)","Purple Cornflower","Purple Iceland Poppy","Purple Lilyturf","Purple Magnolia","Purple Snowflake (Floco de Neve Roxo)","Purple-Pink Bearded Iris","Red Amaryllis","Red Dancing Lady Orchid","Red Hollyhock","Red Winterberry","Sapphirebone Coral (Coral Osso de Safira)","Scarlet Iceland Poppy","Silver Osmanthus","Smokepink Hibiscus (Hibisco Esfumaçado)","Stellar Wish (Desejo Estelar)","Sunflare Bloom (Flor da Erupção Solar)","Sunlit Petal (Pétala Iluminada pelo Sol)","Violet Himalayan Poppy","White Blue-Eyed Anemone","White Bunnycotton","White Chinese Sweetshrub","White Flamingo Flower","White Gladiolus","White Sea Anemone","White Weeping Cherry","White-Purple Clematis","Yellow Bumble Rose (Rosa Zangão Amarela)","Yellow Celebration Rose","Yellow Dancing Lady Orchid","Yellow Gladiolus","Yellow Green Boat Orchid","Yellow Himalayan Poppy","Yellow Iron Chopstick Flower","Yellow Magnolia","Yellow-Orange Iceland Poppy","Yellow-Pink Bearded Iris","Apricot Lotus","Blue Crystal Butterfly Rose","Blue Jeweled Peony","Champagne Gilded Rose","Flower Cake Basket (Cesto de Bolo e Flores)","Hazeglow Fan (Leque de Brilho Enevoado)","Heartbeat Berry (Fruta Palpitante)","Maroon Wintersweet","Merrycap (Capelo Alegre)","Orange Hibiscus Jewelry Box","Peach Jeweled Peony","Peach Unicorn","Peach Wintersweet","Pearl Magnolia","Pink Hibiscus Jewelry Box","Pink Lion's Fortune (Fortuna do Leão Rosa)","Pink Lotus","Pink Unicorn","Pink Water Lily","Purple Glaze Peony","Purple Hibiscus Jewelry Box","Scintilla Pact (Pacto Cintilante)","Silkbloom Fan (Leque de Flor de Seda)","Stardust Fan (Leque de Poeira Estelar)","Violet Unicorn","Warm Gold Abode (Morada de Ouro Quente)","White River Ark","Golden Lion's Blessing (Bênção do Leão Dourado)"],
  "Japa": ["Crimson Hollyhock","Light Blue Wisteria","Light Orange Verbena","Light Pink Verbena","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Iceland Poppy","Purple Magnolia","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","Scarlet Iceland Poppy","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Yellow-Orange Iceland Poppy","Hazeglow Fan (Leque de Brilho Enevoado)","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Purple Glaze Peony","Scintilla Pact (Pacto Cintilante)"],
  "Tefie": ["Pluma de Anjo","Blue Evening Primrose","Crimson Hollyhock","Jade Snowflake (Floco de Neve de Jade)","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Crystal Butterfly Rose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Silver Cycad","Smokepink Hibiscus (Hibisco Esfumaçado)","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yesterday Today Tomorrow","Dream-Painted Eggs (Ovos pintados de Sonho)","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Peach New Dawn Rose","Pink Hibiscus Jewelry Box","Wavelet Swing (Balanço das Ondas)"],
  "Jessie Iasmim": ["Sugarfrost Witch (Bruxa de Açúcar Cristalizado)","Azure Coral Reef","Blue Evening Primrose","Blue Himalayan Poppy","Blue Oleander","Coral Boat Orchid","Crimson Hollyhock","Golden Wintersweet","Light Blue Wisteria","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Purple Glaze Peony","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Blue Jeweled Peony","Flower Cake Basket (Cesto de Bolo e Flores)","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)"],
  "Maryanna": ["Azure Coral Reef","Crimson Hollyhock","Jade Snowflake (Floco de Neve de Jade)","Light Blue Wisteria","Light Orange Verbena","Light Pink Verbena","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Crystal Butterfly Rose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Snowflake (Floco de Neve Roxo)","Red Winterberry","Scarlet Iceland Poppy","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Yellow-Orange Iceland Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)","Wavelet Swing (Balanço das Ondas)"],
  "MelMalkA": ["Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Jade Snowflake (Floco de Neve de Jade)","Lunar Wisteria (Glicínia Lunar)","Pink Anemone","Pink Crystal Butterfly Rose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","Silver Cycad","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Pink Hibiscus Jewelry Box","Purple Glaze Peony","Scintilla Pact (Pacto Cintilante)","Warm Gold Abode (Morada de Ouro Quente)"],
  "Pandinha": ["Pluma de Anjo","Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Lunar Wisteria (Glicínia Lunar)","Orange Star Orchid","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Pink Snowflake (Floco de Neve Rosa)","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Red Winterberry","Scarlet Iceland Poppy","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Hazeglow Fan (Leque de Brilho Enevoado)","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Purple Hibiscus Jewelry Box","Scintilla Pact (Pacto Cintilante)"],
  "Emys": ["Azure Coral Reef","Blue Evening Primrose","Golden Wintersweet","Lunar Wisteria (Glicínia Lunar)","Pink Crystal Butterfly Rose","Pink Hibiscus","Red Winterberry","Silver Cycad","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)"],
  "Nayuki": ["Crimson Hollyhock","Pink Crystal Butterfly Rose","Pink Hibiscus","Red Winterberry","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Purple-Pink Bearded Iris"],
  "Lili_Peony": ["Sugarfrost Witch (Bruxa de Açúcar Cristalizado)","Pink Crystal Butterfly Rose","Pink Hibiscus","White Bunnycotton","Yellow Dancing Lady Orchid","Apricot Lotus","Blue Jeweled Peony"],
  "Ka.koala": ["Crimson Hollyhock","Pink Baby Primrose (Pequena Prímula Rosa)","Pink Hibiscus","Purple Snowflake (Floco de Neve Roxo)","Red Hollyhock","Scarlet Iceland Poppy","White Bunnycotton","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Yellow-Orange Iceland Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Purple Hibiscus Jewelry Box"],
  "Raquel": ["Azure Coral Reef","Blue Evening Primrose","Crimson Hollyhock","Golden Wintersweet","Lunar Wisteria (Glicínia Lunar)","Pink Anemone","Pink Crystal Butterfly Rose","Pink Hibiscus","Red Hollyhock","Red Winterberry","White Bunnycotton","White Flamingo Flower","White Star of Bethlehem","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)","Purple Baby Primrose (Pequena Prímula Roxa)","Purple Snowflake (Floco de Neve Roxo)"],
  "Zeen": ["Blue Evening Primrose","Crimson Hollyhock","Pink Crystal Butterfly Rose","Pink Hibiscus","Red Winterberry","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Heartbeat Berry (Fruta Palpitante)"],
  "Cecilises": ["Blue Evening Primrose","Crimson Hollyhock","Pink Anemone","Pink Crystal Butterfly Rose","Pink Evening Primrose","Pink Hibiscus","Red Hollyhock","Red Winterberry","White Bunnycotton","White Flamingo Flower","Yellow Dancing Lady Orchid","Yellow Himalayan Poppy","Heartbeat Berry (Fruta Palpitante)","Merrycap (Capelo Alegre)","Pearl Magnolia","Scintilla Pact (Pacto Cintilante)"],
}

// Mapa de aliases: nome na planilha → nome real no Notion
const ALIASES: Record<string, string> = {
  // SSR
  "Heartbeat Berry (Fruta Palpitante)": "Fruta Palpitante",
  "Merrycap (Capelo Alegre)": "Capelo Alegre",
  "Merrycak (Capelo Alegre)": "Capelo Alegre",
  "Scintilla Pact (Pacto Cintilante)": "Pacto Cintilante",
  "Hazeglow Fan (Leque de Brilho Enevoado)": "Leque de Brilho Enevoado",
  "Warm Gold Abode (Morada de Ouro Quente)": "Morada de Ouro Quente",
  "Flower Cake Basket (Cesto de Bolo e Flores)": "Cesto de Bolo de Flores",
  "Silkbloom Fan (Leque de Flor de Seda)": "Leque de Flor de Seda",
  "Stardust Fan (Leque de Poeira Estelar)": "Leque de Poeira Estelar",
  "Dream-Painted Eggs (Ovos pintados de Sonho)": "Ovos Pintados de Sonho",
  "Egg Surprise (Ovo Surpresa)": "Ovo Surpresa",
  "Easter Teatime (Hora do Chá de Páscoa)": "Hora do Chá de Páscoa",
  "Wavelet Swing (Balanço das Ondas)": "Balanço das Ondas",
  "Pink Dream Shell (Conha dos Sonhos Rosa)": "Concha dos Sonhos Rosa",
  "Golden Lion's Blessing (Bênção do Leão Dourado)": "Bênção do Leão Dourado",
  "Pink Lion's Fortune (Fortuna do Leão Rosa)": "Fortuna do Leão Rosa",
  "Purple Cloud Slumber (Sonho de Nuvem Roxa)": "Sono de Nuvem Roxa",
  "Guilded Sweet Dream (Doce Sonho Dourado)": "Doce Sonho Dourado",
  "Morada da flor rosa": "Morada da Flor Rosa",
  // UR
  "Dragon Grace (Graça do Dragão)": "Graça do Dragão",
  "Lazy Hour (Hora Preguiçosa)": "Hora Preguiçosa",
  "Pisces-Abyss (Abismo de Peixes)": "Abismo de Peixes (Pisces-Abyss)",
  "Angel Plume (Pluma de Anjo)": "Pluma de Anjo",
  "Sugarfrost Witch (Bruxa de Açúcar Cristalizado)": "Bruxa de Açúcar Cristalizado (Sugarfrost Witch)",
  // SR
  "Lunar Wisteria (Glicínia Lunar)": "Glicínia Lunar",
  "Purple Snowflake (Floco de Neve Roxo)": "Floco de Neve Roxo",
  "Pink Snowflake (Floco de Neve Rosa)": "Floco de Neve Rosa",
  "Jade Snowflake (Floco de Neve de Jade)": "Floco de Neve de Jade",
  "Smokepink Hibiscus (Hibisco Esfumaçado)": "Hibisco Esfumaçado",
  "Sapphirebone Coral (Coral Osso de Safira)": "Coral Osso de Safira",
  "Stellar Wish (Desejo Estelar)": "Desejo Estelar",
  "Sunflare Bloom (Flor da Erupção Solar)": "Flor da Erupção Solar",
  "Sunlit Petal (Pétala Iluminada pelo Sol)": "Pétala Iluminada pelo Sol",
  "Yellow Bumble Rose (Rosa Zangão Amarela)": "Rosa Zangão Amarela",
  "Yellow Green Boat Orchid": "Yellow-Green Boat Orchid",
  "Azure Nemesia (Nemésia Azul-celeste)": "Nemésia Azul-celeste",
  "Pink Baby Primrose (Pequena Prímula Rosa)": "Pequena Prímula Rosa",
  "Purple Baby Primrose (Pequena Prímula Roxa)": "Pequena Prímula Roxa",
  "Snowfall Baby Primrose (Pequena Prímula Nevada)": "Pequena Prímula Nevada",
  "White Flamingo Flower": "White Flamingo Flower", // verificar se existe
  "Yellow Dancing Lady Orchid": "Yellow Dancing Lady Orchid", // verificar
  "Yellow Himalayan Poppy": "Yellow Himalayan Poppy", // verificar
  "Yesterday Today Tomorrow": "Yesterday-Today-Tomorrow",
}

async function queryAll(database_id: string) {
  const results: any[] = []
  let cursor: string | undefined
  do {
    const res: any = await notion.databases.query({ database_id, page_size: 100, start_cursor: cursor })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

// GET — simulação: mostra o que seria adicionado sem alterar nada
export async function GET() {
  try {
    const [floresPags, floristaPags] = await Promise.all([
      queryAll(process.env.NOTION_FLOWERS_DB!),
      queryAll(process.env.NOTION_MEMBERS_DB!),
    ])

    // Mapa nome normalizado → id da flor no Notion
    const flowerByName2: Record<string, string> = {}
    for (const p of floresPags) {
      const nome = p.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ?? ""
      if (nome) flowerByName2[nome.toLowerCase()] = p.id
    }

    function resolveFlower2(nome: string): string | null {
      if (flowerByName2[nome.toLowerCase()]) return flowerByName2[nome.toLowerCase()]
      const alias = ALIASES[nome]
      if (alias && flowerByName2[alias.toLowerCase()]) return flowerByName2[alias.toLowerCase()]
      return null
    }

    const resultado: { florista: string; flores_a_adicionar: string[]; flores_nao_encontradas: string[] }[] = []

    for (const m of floristaPags) {
      const nick = m.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text ?? ""

      // Encontrar a chave correspondente na planilha (busca flexível)
      const chave = Object.keys(PLANILHA).find(k =>
        nick.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(nick.toLowerCase())
      )
      if (!chave) continue

      const floresNoPlan = PLANILHA[chave]
      const floresNoNotion = new Set(
        (m.properties["🌸 Flores que tem"]?.relation ?? []).map((r: any) => r.id)
      )

      const aAdicionar: string[] = []
      const naoEncontradas: string[] = []

      for (const nomeFlor of floresNoPlan) {
        const florId = resolveFlower(nomeFlor)
        if (!florId) { naoEncontradas.push(nomeFlor); continue }
        if (!floresNoNotion.has(florId)) aAdicionar.push(nomeFlor)
      }

      if (aAdicionar.length > 0 || naoEncontradas.length > 0) {
        resultado.push({ florista: nick, flores_a_adicionar: aAdicionar, flores_nao_encontradas: naoEncontradas })
      }
    }

    return NextResponse.json({
      modo: "SIMULAÇÃO — nenhuma alteração feita",
      total_floristas: resultado.length,
      total_flores_a_adicionar: resultado.reduce((acc, r) => acc + r.flores_a_adicionar.length, 0),
      detalhes: resultado,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}

// POST — executa a sincronização de fato
export async function POST(request: NextRequest) {
  try {
    const { confirmar } = await request.json()

    const [floresPags, floristaPags] = await Promise.all([
      queryAll(process.env.NOTION_FLOWERS_DB!),
      queryAll(process.env.NOTION_MEMBERS_DB!),
    ])

    const flowerByName: Record<string, string> = {}
    for (const p of floresPags) {
      const nome = p.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ?? ""
      if (nome) flowerByName[nome.toLowerCase()] = p.id
    }

    function resolveFlower(nome: string): string | null {
      if (flowerByName[nome.toLowerCase()]) return flowerByName[nome.toLowerCase()]
      const alias = ALIASES[nome]
      if (alias && flowerByName[alias.toLowerCase()]) return flowerByName[alias.toLowerCase()]
      return null
    }

    const log: { florista: string; adicionadas: string[]; nao_encontradas: string[] }[] = []

    for (const m of floristaPags) {
      const nick = m.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text ?? ""

      const chave = Object.keys(PLANILHA).find(k =>
        nick.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(nick.toLowerCase())
      )
      if (!chave) continue

      const floresNoPlan = PLANILHA[chave]
      const relAtual: any[] = m.properties["🌸 Flores que tem"]?.relation ?? []
      const idsAtuais = new Set(relAtual.map((r: any) => r.id))

      const novasRel: { id: string }[] = []
      const adicionadas: string[] = []
      const naoEncontradas: string[] = []

      for (const nomeFlor of floresNoPlan) {
        const florId = resolveFlower(nomeFlor)
        if (!florId) { naoEncontradas.push(nomeFlor); continue }
        if (!idsAtuais.has(florId)) {
          novasRel.push({ id: florId })
          adicionadas.push(nomeFlor)
        }
      }

      if (adicionadas.length > 0) {
        log.push({ florista: nick, adicionadas, nao_encontradas: naoEncontradas })

        if (confirmar === true) {
          // Notion limita relations a 100 por request
          // Enviamos as novas em lotes, mantendo as existentes
          const todasRel = [...relAtual, ...novasRel]
          const BATCH = 100

          // Primeiro update: substitui com as primeiras 100
          await notion.pages.update({
            page_id: m.id,
            properties: {
              "🌸 Flores que tem": {
                relation: todasRel.slice(0, BATCH),
              },
            },
          })

          // Lotes seguintes: append das restantes
          for (let i = BATCH; i < todasRel.length; i += BATCH) {
            // Busca o estado atual para garantir consistência
            const current: any = await notion.pages.retrieve({ page_id: m.id })
            const currentRel: any[] = current.properties["🌸 Flores que tem"]?.relation ?? []
            const currentIds = new Set(currentRel.map((r: any) => r.id))

            const batch = todasRel.slice(i, i + BATCH).filter(r => !currentIds.has(r.id))
            if (batch.length === 0) continue

            await notion.pages.update({
              page_id: m.id,
              properties: {
                "🌸 Flores que tem": {
                  relation: [...currentRel, ...batch],
                },
              },
            })
          }
        }
      }
    }

    return NextResponse.json({
      executado: confirmar === true,
      aviso: confirmar !== true
        ? "SIMULAÇÃO — envie { confirmar: true } para aplicar"
        : "✅ Flores adicionadas no Notion!",
      total_floristas_atualizadas: log.length,
      total_flores_adicionadas: log.reduce((acc, r) => acc + r.adicionadas.length, 0),
      detalhes: log,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}