import { NextResponse } from "next/server"
import { notion } from "@/app/lib/notion"

export async function GET() {
  const [solRes, floresRes, floristasRes] = await Promise.all([
    notion.databases.retrieve({ database_id: "365210e1771880af853bddc14546140e" }),
    notion.databases.retrieve({ database_id: "9af7938f441e47a1a188b878c56a6788" }),
    notion.databases.retrieve({ database_id: "a6d317af75694d56bfd155ad562b5797" }),
  ])

  return NextResponse.json({
    solicitacoes: Object.entries((solRes as any).properties).map(([k, v]: any) => ({ key: k, type: v.type })),
    flores:       Object.entries((floresRes as any).properties).map(([k, v]: any) => ({ key: k, type: v.type })),
    floristas:    Object.entries((floristasRes as any).properties).map(([k, v]: any) => ({ key: k, type: v.type })),
  })
}