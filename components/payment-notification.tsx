"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function PaymentNotification() {
  const { user } = useAuth()
  const [unpaidWeeks, setUnpaidWeeks] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUnpaidWeeks = async () => {
      if (!user) return

      try {
        // Check if notifications are enabled for this user
        const { data: profileData } = await supabase
          .from("profiles")
          .select("notifications_enabled")
          .eq("user_id", user.id)
          .single()

        // Default to true if no profile exists
        const notificationsEnabled = profileData?.notifications_enabled ?? true
        setNotificationsEnabled(notificationsEnabled)

        // If notifications are disabled, don't fetch unpaid weeks
        if (!notificationsEnabled) {
          setIsLoading(false)
          return
        }

        // Count unpaid weeks
        const { count, error } = await supabase
          .from("weekly_payments")
          .select("id", { count: "exact" })
          .eq("student_id", user.id)
          .eq("payment_status", "belum dibayar")

        if (error) throw error

        setUnpaidWeeks(count || 0)
      } catch (error) {
        console.error("Error fetching unpaid weeks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role !== "admin") {
      fetchUnpaidWeeks()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Don't show anything while loading or if user is admin
  if (isLoading || !user || user.role === "admin" || !notificationsEnabled) {
    return null
  }

  // Only show notification if there are 3 or more unpaid weeks
  if (unpaidWeeks < 3) {
    return null
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 p-2">
      <div className="bg-amber-500 text-white p-3 rounded-md shadow-lg flex items-start justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">
            Anda memiliki <strong>{unpaidWeeks} minggu</strong> kas yang belum dibayar. Segera lakukan pembayaran.
          </p>
        </div>
        <Button
          size="sm"
          className="ml-2 bg-white text-amber-500 hover:bg-white/90"
          onClick={() => router.push("/dashboard")}
        >
          Bayar Sekarang
        </Button>
      </div>
    </div>
  )
}
