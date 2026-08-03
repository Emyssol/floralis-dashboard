import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"

// Mesmo nome de propriedade usado em getDashboardData.ts
const PROP_QUEM_TEM = "👑 Quem tem"
const CARGOS_ADMIN = ["Líder", "Co-líder", "Ancião"]

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

// ── POST — marca automaticamente que uma florista tem uma flor ──
// Fluxo: lê a flor → lê quem já está em "👑 Quem tem" → acrescenta a
// florista preservando a lista atual → salva a lista completa de volta.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { flower_id, florista_id } = await request.json()

    if (!flower_id || !florista_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios: flower_id, florista_id" },
        { status: 400 }
      )
    }

    // Só pode marcar posse em nome da própria florista — a não ser que seja admin
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)
    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para marcar posse em nome dessa florista" },
        { status: 403 }
      )
    }

    // 1. Buscar a página da flor
    const flowerPage: any = await notion.pages.retrieve({ page_id: flower_id })
    const quemTemProp = flowerPage.properties?.[PROP_QUEM_TEM]

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