import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { notion } from "@/app/lib/notion"

// Mesma base de Floristas já usada em getDashboardData.ts
const FLORISTAS_DB = process.env.NOTION_MEMBERS_DB!

type FloristaAuth = {
  id: string
  name: string
  cargo: string
  guild: string
}

// Busca a florista no Notion cujo "📧 Email" bate com o e-mail do login Google
async function getFloristaByEmail(email: string): Promise<FloristaAuth | null> {
  const res = await notion.databases.query({
    database_id: FLORISTAS_DB,
    filter: {
      property: "📧 Email",
      email: { equals: email.trim().toLowerCase() },
    },
  })

  const page = res.results[0] as any
  if (!page) return null

  return {
    id:    page.id,
    name:  page.properties["🎮 Nick do jogo"]?.title?.[0]?.plain_text ?? "Florista",
    cargo: page.properties["🏷️ Cargo"]?.select?.name ?? "Membro",
    guild: page.properties["🎖️ Guilda"]?.select?.name ?? "🦋 Floralis",
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    // Se quiser uma tela de login customizada depois, aponta aqui.
    // Por enquanto usa a tela padrão do NextAuth.
  },
  callbacks: {
    // Só deixa entrar quem tem e-mail cadastrado como florista no Notion
    async signIn({ user }) {
      if (!user.email) return false
      const florista = await getFloristaByEmail(user.email)
      return !!florista
    },

    // Enriquece o token com os dados da florista (feito 1x no login, fica no cookie)
    async jwt({ token, user }) {
      if (user?.email) {
        const florista = await getFloristaByEmail(user.email)
        if (florista) {
          token.floristaId = florista.id
          token.cargo = florista.cargo
          token.guild = florista.guild
          token.name = florista.name
        }
      }
      return token
    },

    // Repassa os dados do token pra sessão, disponível em toda a aplicação
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.floristaId as string
        session.user.cargo = token.cargo as string
        session.user.guild = token.guild as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
})