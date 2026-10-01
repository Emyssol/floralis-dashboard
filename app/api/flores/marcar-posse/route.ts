import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"
import { redis, PONTOS_EXTRA_KEY } from "@/app/lib/redis"

// Mesmos nomes de propriedade usados em getDashboardData.ts
const PROP_QUEM_TEM = "👑 Quem tem"
const PROP_NOME     = "🌸 Nome da Flor"
const PROP_COMPETICAO = "🎖️ Flores para Competição"

// Lê a relation inteira quando ela é grande demais para vir na página normal
// (mesmo padrão de paginação já usado em getDashboardData.ts → getFullRelation)
async function getFullRelationIds(pageId: string, propertyId: string): Promise<string[]> {
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
    } else {
      break
    }
  } while (cursor)
  return ids
}

// ── POST — marca ou desmarca que uma florista tem uma flor ──
// Marcar (padrão): lê quem já está em "👑 Quem tem" → acrescenta a florista
// preservando a lista atual → salva a lista completa de volta.
// Desmarcar (remover: true): tira a florista de "👑 Quem tem" e, em cascata,
// tira a flor da lista de competição dela (se estiver lá) e zera o bônus
// permanente dessa flor no Redis — uma flor que ela não tem mais não faz
// sentido continuar "preferida" nem premiada.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { flower_id, florista_id, remover } = await request.json()

    if (!flower_id || !florista_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios: flower_id, florista_id" },
        { status: 400 }
      )
    }

    // Só pode marcar/desmarcar posse em nome da própria florista — a não ser que seja admin
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)
    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para alterar a posse dessa florista" },
        { status: 403 }
      )
    }

    // 1. Buscar a página da flor
    const flowerPage: any = await notion.pages.retrieve({ page_id: flower_id })
    const quemTemProp = flowerPage.properties?.[PROP_QUEM_TEM]
    const flowerName: string = flowerPage.properties?.[PROP_NOME]?.title?.[0]?.plain_text ?? ""

    if (!quemTemProp) {
      return NextResponse.json(
        { error: `Propriedade "${PROP_QUEM_TEM}" não encontrada na flor` },
        { status: 500 }
      )
    }

    // 2. Ler todos os IDs atuais de "Quem tem" (com paginação se a lista for grande)
    const currentIds: string[] = quemTemProp.has_more
      ? await getFullRelationIds(flower_id, quemTemProp.id)
      : (quemTemProp.relation?.map((r: any) => r.id) ?? [])

    if (remover) {
      // Não tinha mesmo — não faz nada
      if (!currentIds.includes(florista_id)) {
        return NextResponse.json({ success: true, alreadyRemoved: true })
      }

      const updatedIds = currentIds.filter((id) => id !== florista_id)
      await notion.pages.update({
        page_id: flower_id,
        properties: {
          [PROP_QUEM_TEM]: { relation: updatedIds.map((id) => ({ id })) },
        },
      })

      // Cascata: tira da competição (se estava lá) e zera o bônus — best-effort,
      // não falha a resposta principal se alguma dessas duas der erro.
      if (flowerName) {
        try {
          const floristaPage: any = await notion.pages.retrieve({ page_id: florista_id })
          const compProp = floristaPage.properties?.[PROP_COMPETICAO]
          if (compProp) {
            const compIds: string[] = compProp.has_more
              ? await getFullRelationIds(florista_id, compProp.id)
              : (compProp.relation?.map((r: any) => r.id) ?? [])
            if (compIds.includes(flower_id)) {
              await notion.pages.update({
                page_id: florista_id,
                properties: {
                  [PROP_COMPETICAO]: { relation: compIds.filter((id) => id !== flower_id).map((id) => ({ id })) },
                },
              })
            }
          }
        } catch (error: any) {
          console.error("[API Marcar Posse] Falha ao remover da competição na cascata:", error?.message)
        }

        try {
          await redis.hdel(PONTOS_EXTRA_KEY, `${florista_id}::${flowerName}`)
        } catch (error: any) {
          console.error("[API Marcar Posse] Falha ao zerar bônus na cascata:", error?.message)
        }
      }

      return NextResponse.json({ success: true, alreadyRemoved: false, total: updatedIds.length })
    }

    // 3. Já tem essa florista relacionada? Não faz nada (evita escrita desnecessária)
    if (currentIds.includes(florista_id)) {
      return NextResponse.json({ success: true, alreadyHad: true })
    }

    // 4. Acrescenta a nova florista preservando quem já estava e salva a lista completa
    const updatedIds = [...currentIds, florista_id]

    await notion.pages.update({
      page_id: flower_id,
      properties: {
        [PROP_QUEM_TEM]: {
          relation: updatedIds.map((id) => ({ id })),
        },
      },
    })

    return NextResponse.json({ success: true, alreadyHad: false, total: updatedIds.length })

  } catch (error: any) {
    console.error("[API Marcar Posse] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
