import { NextResponse } from "next/server"
import { getDashboardData } from "@/app/lib/getDashboardData"

let cache: { data: any; ts: number } | null = null
const CACHE_TTL = 60 * 1000

export async function GET(request: Request) {
  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1"

  if (!forceRefresh && cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    })
  }

  try {
    const data = await getDashboardData(forceRefresh)
    cache = { data, ts: Date.now() }
    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar dados do Notion" }, { status: 500 })
  }
}