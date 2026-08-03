import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string      // page id da florista no Notion
      cargo: string    // "Líder" | "Co-líder" | "Ancião" | "Elite" | "Membro"
      guild: string    // "🦋 Floralis" | "🧸 Floralis Baby"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    floristaId?: string
    cargo?: string
    guild?: string
  }
}