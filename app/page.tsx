import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import ClientDashboard from "@/app/components/ClientDashboard"
import { auth } from "@/app/lib/auth"

async function revalidateData() {
  "use server"
  revalidatePath("/")
}

export default async function Home() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Não busca dados aqui — deixa o ClientDashboard buscar do lado do
  // navegador, assim a tela de carregamento (logo + barra de progresso)
  // aparece na hora, em vez da página ficar em branco esperando o Notion.
  return <ClientDashboard onRevalidate={revalidateData} />
}