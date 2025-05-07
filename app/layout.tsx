import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { PaymentNotification } from "@/components/payment-notification"
import { WeeklyReminder } from "@/components/weekly-reminder"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KasIn - Aplikasi Kas Digital",
  description: "Aplikasi manajemen kas digital untuk sekolah",
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <PaymentNotification />
            <WeeklyReminder />
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
