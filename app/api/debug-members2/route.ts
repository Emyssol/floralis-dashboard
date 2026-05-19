import { NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

export async function GET() {
  const members = await notion.databases.query({
    database_id: process.env.NOTION_MEMBERS_DB!,
    page_size: 2,
  })

  const debug = members.results.map((page: any) => ({
    name: page.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text,
    allProps: Object.entries(page.properties).map(([key, val]: any) => ({
      key,
      type: val.type,
      sample:
        val.type === "relation"
          ? { count: val.relation?.length, has_more: val.has_more, ids: val.relation?.slice(0, 2).map((r: any) => r.id) }
          : val.type === "select"       ? val.select?.name
          : val.type === "status"       ? val.status?.name
          : val.type === "title"        ? val.title?.[0]?.plain_text
          : val.type === "multi_select" ? val.multi_select?.map((x: any) => x.name)
          : "—",
    })),
  }))

  return NextResponse.json(debug)
}