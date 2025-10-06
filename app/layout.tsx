import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import Navigation from "@/components/navigation"
import ChatbotAssistant from "@/components/chatbot-assistant"

export const metadata: Metadata = {
  title: "EcoGenAI — Smart Waste Management",
  description: "Classify waste with AI, earn rewards, and make a positive environmental impact",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
            {children}
            <ChatbotAssistant />
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
