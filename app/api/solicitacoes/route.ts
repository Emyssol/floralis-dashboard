import { NextRequest, NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

const SOLICITACOES_DB = process.env.NOTION_SOLICITACOES_DB!

// ── POST — criar nova solicitação ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, florista_id, flores_ids, florista_nome, flores_nomes } = body

    console.log("[Solicitações] Recebido:", { tipo, florista_id, flores_ids, florista_nome })
    console.log("[Solicitações] DB:", SOLICITACOES_DB)

    if (!SOLICITACOES_DB) {
      return NextResponse.json({ error: "NOTION_SOLICITACOES_DB não configurado no .env.local" }, { status: 500 })
    }

    if (!tipo || !florista_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios: tipo, florista_id" },
        { status: 400 }
      )
    }

    // Título automático
    const titulo = tipo === "Possui Flor"
      ? `🌸 ${florista_nome} tem nova flor`
      : `🎖️ ${florista_nome} atualizou flores para competição`

    const properties: Record<string, any> = {
      // "📝 Solicitação" = Title
      "📝 Solicitação": {
        title: [{ text: { content: titulo } }],
      },
      // "📋 Tipo" = Select (opções: "Possui Flor" | "Competição")
      "📋 Tipo": {
        select: { name: tipo },
      },
      // "👤 Florista" = Relation para Floristas DB
      "👤 Florista": {
        relation: [{ id: florista_id }],
      },
      // "✅ Status" = Status (Pendente por padrão)
      "✅ Status": {
        status: { name: "Pendente" },
      },
      // "🔗 Origem" = Select — identifica que veio do dashboard
      "🔗 Origem": {
        select: { name: "Dashboard" },
      },
    }

    // "🌸 Flor" = Relation para Flores DB (opcional, 1 ou mais)
    if (flores_ids && flores_ids.length > 0) {
      properties["🌸 Flor"] = {
        relation: flores_ids.map((id: string) => ({ id })),
      }
    }

    const page = await notion.pages.create({
      parent: { database_id: SOLICITACOES_DB },
      properties,
    })

    return NextResponse.json({
      success: true,
      id: page.id,
      titulo,
      tipo,
      florista: florista_nome,
      flores: flores_nomes,
    })

  } catch (error: any) {
    console.error("[API Solicitações] Erro ao criar:", error?.message)
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}

// ── GET — buscar solicitações pendentes (badge de admin) ──
export async function GET() {
  try {
    const res = await notion.databases.query({
      database_id: SOLICITACOES_DB,
      filter: {
        property: "✅ Status",
        status: { equals: "Pendente" },
      },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    })

    const solicitacoes = res.results.map((page: any) => ({
      id:       page.id,
      titulo:   page.properties["📝 Solicitação"]?.title?.[0]?.plain_text ?? "",
      tipo:     page.properties["📋 Tipo"]?.select?.name ?? "",
      status:   page.properties["✅ Status"]?.status?.name ?? "",
      criado:   page.created_time,
      florista: page.properties["👤 Florista"]?.relation?.[0]?.id ?? "",
      flores:   page.properties["🌸 Flor"]?.relation?.map((r: any) => r.id) ?? [],
    }))

    return NextResponse.json({ count: solicitacoes.length, solicitacoes })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}

// ── PATCH — atualizar status (admin marca como concluído) ──
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: "id e status obrigatórios" }, { status: 400 })
    }

    await notion.pages.update({
      page_id: id,
      properties: {
        "✅ Status": { status: { name: status } },
      },
    })

    return NextResponse.json({ success: true, id, status })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}