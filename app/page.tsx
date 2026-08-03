import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import ClientDashboard from "@/app/components/ClientDashboard"
import { getDashboardData } from "@/app/lib/getDashboardData"
import { auth } from "@/app/lib/auth"

// Revalida a cada 60s no Vercel (não afeta dev local)
export const revalidate = 60

async function revalidateData() {
  "use server"
  revalidatePath("/")
}

export default async function Home() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  try {
    const data = await getDashboardData()
    return (
      <ClientDashboard
        initialFlowers={data.flowers}
        initialMembers={data.members}
        onRevalidate={revalidateData}
      />
    )
  } catch {
    // Fallback: ClientDashboard busca client-side
    return <ClientDashboard />
  }
}