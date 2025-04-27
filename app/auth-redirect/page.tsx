"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AuthRedirectPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, isAuthenticated } = useAuth()

  const destination = searchParams.get("to") || "/dashboard"

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Refresh user data to ensure we have the latest auth state
        await refreshUser()

        // Check if we're authenticated
        if (isAuthenticated) {
          // Redirect to destination
          window.location.href = destination
        } else {
          // If not authenticated after refresh, show error
          setError("Autentikasi gagal. Silakan coba login kembali.")

          // Redirect back to login after a delay
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        }
      } catch (err) {
        console.error("Redirect error:", err)
        setError("Terjadi kesalahan. Silakan coba lagi.")

        // Redirect back to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    handleRedirect()
  }, [refreshUser, isAuthenticated, destination, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1B2B44] p-4">
      <div className="text-center">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Mengalihkan...</h1>
            <p className="text-white/70">Mohon tunggu sebentar</p>
          </>
        )}
      </div>
    </div>
  )
}
