import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { notion } from "@/app/lib/notion"
import { CARGOS_ADMIN } from "@/app/lib/permissoes"

// Mesmo nome de propriedade usado em getDashboardData.ts
const PROP_COMPETICAO = "🎖️ Flores para Competição"
const PROP_QUEM_TEM   = "👑 Quem tem"

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

// Confere no Notion se a florista realmente tem essa flor (não confia só no
// que o client mandou) — em lotes pequenos pra não estourar o rate limit.
async function filterOwnedByFlorista(floresIds: string[], floristaId: string): Promise<string[]> {
  const owned: string[] = []
  const BATCH = 5
  for (let i = 0; i < floresIds.length; i += BATCH) {
    const batch = floresIds.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(async (flowerId) => {
        const page: any = await notion.pages.retrieve({ page_id: flowerId })
        const quemTemProp = page.properties?.[PROP_QUEM_TEM]
        const ownerIds: string[] = quemTemProp?.has_more
          ? await getFullRelationIds(flowerId, quemTemProp.id)
          : (quemTemProp?.relation?.map((r: any) => r.id) ?? [])
        return { flowerId, isOwner: ownerIds.includes(floristaId) }
      })
    )
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.isOwner) owned.push(r.value.flowerId)
    }
  }
  return owned
}

// ── POST — substitui a seleção semanal de flores para competição ──
// Diferente da posse: aqui a lista é SUBSTITUÍDA inteira (não acrescentada),
// porque representa "as flores desta semana", não um histórico acumulado.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { florista_id, flores_ids } = await request.json()

    if (!florista_id || !Array.isArray(flores_ids)) {
      return NextResponse.json(
        { error: "Campos obrigatórios: florista_id, flores_ids (array)" },
        { status: 400 }
      )
    }

    // Só pode editar a própria lista — a não ser que seja admin editando por outra florista
    const isSelf  = session.user.id === florista_id
    const isAdmin = CARGOS_ADMIN.includes(session.user.cargo)

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para editar as flores de competição dessa florista" },
        { status: 403 }
      )
    }

    // Regra de negócio: só entra na competição quem a florista já tem de
    // verdade. O client já esconde flores sem posse, mas isso protege contra
    // uma chamada direta à API — flores sem posse são silenciosamente
    // ignoradas (não derruba a solicitação inteira por causa de uma só).
    const ownedIds = await filterOwnedByFlorista(flores_ids, florista_id)
    const ignored = flores_ids.length - ownedIds.length

    // Substitui a relation inteira na página da própria florista
    await notion.pages.update({
      page_id: florista_id,
      properties: {
        [PROP_COMPETICAO]: {
          relation: ownedIds.map((id: string) => ({ id })),
        },
      },
    })

    return NextResponse.json({ success: true, total: ownedIds.length, ignored })

  } catch (error: any) {
    console.error("[API Marcar Competição] Erro:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
