import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import TextureBackground from "@/app/components/TextureBackground"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FLORALIS — Guilda Dashboard",
  description: "Dashboard mágico da guilda Floralis — catálogo de flores e floristas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full">
        <TextureBackground />
        {children}
      </body>
    </html>
  )
}