"use client"

import { useEffect, useState } from "react"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  // Perbaiki fungsi verifikasi token di halaman login
  useEffect(() => {
    // Check if token exists in localStorage or sessionStorage directly
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")

    if (token) {
      console.log("Login page - Token found, verifying validity")

      // Verifikasi token dengan API sebelum redirect
      fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            console.log("Login page - Token invalid")
            setIsChecking(false)
            throw new Error("Invalid token")
          }
        })
        .then((data) => {
          console.log("Login page - Token valid, checking role")
          // Check if user is admin - if so, redirect to admin dashboard
          if (data.user && data.user.role === "admin") {
            router.push("/admin/dashboard")
          } else {
            // If user is not admin, redirect to regular dashboard
            router.push("/dashboard")
          }
        })
        .catch((error) => {
          console.error("Login page - Error verifying token:", error)
          setIsChecking(false)
        })

      return
    }

    // If no token, continue with normal auth check
    setIsChecking(false)
  }, [router])

  // Only redirect if authenticated and not in loading state
  useEffect(() => {
    if (!isChecking && !loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isChecking, loading, isAuthenticated, router])

  // Show loading state while checking auth
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B2B44]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login form
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1B2B44]">
      <LoginForm />
    </main>
  )
}
