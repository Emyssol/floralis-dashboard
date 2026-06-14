import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import TextureBackground from "@/app/components/TextureBackground"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Floralis — Guilda Dashboard",
  description: "Floralis Guild Collection Dashboard",
  applicationName: "Floralis",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/iconfloralis.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/appletouch.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/appletouch.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Floralis",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#D4608A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <head>
        {/* Apple PWA meta tags extras */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Floralis" />
        <link rel="apple-touch-icon" href="/appletouch.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/appletouch.png" />
        {/* Android / PWA */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Floralis" />
        {/* Theme */}
        <meta name="theme-color" content="#D4608A" />
        <meta name="msapplication-TileColor" content="#D4608A" />
        <meta name="msapplication-TileImage" content="/iconfloralis.png" />
      </head>
      <body className="min-h-full">
        <TextureBackground />
        {children}
      </body>
    </html>
  )
}