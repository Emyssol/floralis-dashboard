import { NextRequest, NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

async function queryAll(database_id: string) {
  const results: any[] = []
  let cursor: string | undefined
  do {
    const res: any = await notion.databases.query({
      database_id, page_size: 100, start_cursor: cursor,
    })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

// GET — relatório de inconsistências
// POST { confirmar: true } — remove flores inválidas da competição
export async function GET() {
  return handler(false)
}

export async function POST(request: NextRequest) {
  const { confirmar } = await request.json()
  return handler(confirmar === true)
}

async function handler(confirmar: boolean) {
  try {
    const membros = await queryAll(process.env.NOTION_MEMBERS_DB!)

    const relatorio: {
      florista: string
      id: string
      flores_invalidas: string[]
      competicao_valida: string[]
    }[] = []

    for (const m of membros) {
      const nick = m.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text ?? ""
      if (!nick) continue

      const temRel: any[]  = m.properties["🌸 Flores que tem"]?.relation ?? []
      const compRel: any[] = m.properties["🎖️ Flores para Competição"]?.relation ?? []

      const temIds = new Set(temRel.map((r: any) => r.id))

      const compValidas   = compRel.filter((r: any) => temIds.has(r.id))
      const compInvalidas = compRel.filter((r: any) => !temIds.has(r.id))

      if (compInvalidas.length === 0) continue

      // Buscar nomes das flores inválidas
      const nomesInvalidos: string[] = []
      for (const r of compInvalidas) {
        try {
          const page: any = await notion.pages.retrieve({ page_id: r.id })
          const nome = page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ?? r.id
          nomesInvalidos.push(nome)
        } catch {
          nomesInvalidos.push(r.id)
        }
      }

      const nomesValidos: string[] = []
      for (const r of compValidas) {
        try {
          const page: any = await notion.pages.retrieve({ page_id: r.id })
          const nome = page.properties["🌸 Nome da Flor"]?.title?.[0]?.plain_text ?? r.id
          nomesValidos.push(nome)
        } catch {
          nomesValidos.push(r.id)
        }
      }

      relatorio.push({
        florista: nick,
        id: m.id,
        flores_invalidas: nomesInvalidos,
        competicao_valida: nomesValidos,
      })

      if (confirmar) {
        await notion.pages.update({
          page_id: m.id,
          properties: {
            "🎖️ Flores para Competição": {
              relation: compValidas.map((r: any) => ({ id: r.id })),
            },
          },
        })
      }
    }

    return NextResponse.json({
      executado: confirmar,
      aviso: confirmar
        ? "✅ Flores inválidas removidas da competição!"
        : "SIMULAÇÃO — envie POST { confirmar: true } para aplicar",
      total_floristas: relatorio.length,
      total_flores_removidas: relatorio.reduce((a, r) => a + r.flores_invalidas.length, 0),
      detalhes: relatorio,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}