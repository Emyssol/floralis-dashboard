import { revalidatePath } from "next/cache"
import ClientDashboard from "@/app/components/ClientDashboard"
import { getDashboardData } from "@/app/lib/getDashboardData"

// Revalida a cada 60s no Vercel (não afeta dev local)
export const revalidate = 60

async function revalidateData() {
  "use server"
  revalidatePath("/")
}

export default async function Home() {
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