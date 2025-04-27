"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface WeeklyPayment {
  id: string
  week_number: number
  week_start_date: string
  week_end_date: string
  payment_status: "belum dibayar" | "lunas"
}

export function WeeklyReminder() {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState<WeeklyPayment | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCurrentWeek = async () => {
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

        // If notifications are disabled, don't fetch current week
        if (!notificationsEnabled) {
          setIsLoading(false)
          return
        }

        // Get current date
        const now = new Date()

        // Get current week payment
        const { data, error } = await supabase
          .from("weekly_payments")
          .select("id, week_number, week_start_date, week_end_date, payment_status")
          .eq("student_id", user.id)
          .lte("week_start_date", now.toISOString())
          .gte("week_end_date", now.toISOString())
          .eq("payment_status", "belum dibayar")
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" which is expected if all payments are made
          throw error
        }

        setCurrentWeek(data || null)
      } catch (error) {
        console.error("Error fetching current week payment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role !== "admin") {
      fetchCurrentWeek()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Don't show anything while loading or if user is admin
  if (isLoading || !user || user.role === "admin" || !notificationsEnabled) {
    return null
  }

  // Only show reminder if there's an unpaid current week
  if (!currentWeek) {
    return null
  }

  // Only show reminder on Monday and Thursday
  const today = new Date().getDay()
  if (today !== 1 && today !== 4) {
    // 1 is Monday, 4 is Thursday
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 p-2">
      <div className="bg-blue-500 text-white p-3 rounded-md shadow-lg flex items-start justify-between">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">
            Pembayaran kas minggu ke-{currentWeek.week_number}({formatDate(currentWeek.week_start_date)} -{" "}
            {formatDate(currentWeek.week_end_date)}) belum dilakukan.
          </p>
        </div>
        <Button
          size="sm"
          className="ml-2 bg-white text-blue-500 hover:bg-white/90"
          onClick={() => router.push("/dashboard")}
        >
          Bayar Sekarang
        </Button>
      </div>
    </div>
  )
}
