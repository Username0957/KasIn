"use client"

import { useEffect } from "react"
import RegisterForm from "@/components/register-form"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const isDevelopment = process.env.NODE_ENV === "development"

  useEffect(() => {
    // Redirect to login page if not in development mode
    if (!isDevelopment) {
      router.push("/login")
    }
  }, [router, isDevelopment])

  // Only render the form in development mode
  if (!isDevelopment) {
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#1B2B44]">
      <RegisterForm />
    </main>
  )
}
