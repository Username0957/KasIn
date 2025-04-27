"use client"

import type React from "react"
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <CustomThemeProvider>{children}</CustomThemeProvider>
}
