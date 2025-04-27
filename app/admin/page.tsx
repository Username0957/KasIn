"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/admin-login")
      } else if (!isAdmin) {
        router.push("/dashboard")
      } else {
        // Only redirect to admin dashboard if user is authenticated and admin
        router.push("/admin/dashboard")
      }
    }
  }, [router, isAdmin, isAuthenticated, loading])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white">Mengalihkan ke halaman transaksi admin...</p>
      </div>
    </div>
  )
}
