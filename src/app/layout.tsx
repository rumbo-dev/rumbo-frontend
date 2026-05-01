import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AIChatButton from "@/components/AIChatButton"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rumbo - Freight Operations Platform",
  description: "AI-powered freight forwarding operations management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}<AIChatButton /></body>
    </html>
  )
}
