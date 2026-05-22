import { Client } from "@notionhq/client"

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  timeoutMs: 90_000, // 90s — padrão é 60s, insuficiente para guilds grandes
})