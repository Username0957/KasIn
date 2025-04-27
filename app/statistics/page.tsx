"use client"

import BottomNav from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Loader2, Calendar } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface MonthlyData {
  month: string
  income: number
}

export default function StatisticsPage() {
  const { user, loading, refreshUser, isAuthenticated } = useAuth()
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [unpaidAmount, setUnpaidAmount] = useState<number | null>(null)
  const router = useRouter()

  // First, check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser()
        setAuthChecked(true)
      } catch (error) {
        console.error("Error checking auth:", error)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [refreshUser])

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (authChecked && !loading && !isAuthenticated) {
      console.log("Statistics - Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [authChecked, loading, isAuthenticated, router])

  useEffect(() => {
    const fetchStatisticsData = async () => {
      if (!user) return

      try {
        // Fetch total income
        const { data: incomeData, error: incomeError } = await supabase.rpc("get_total_income")

        if (incomeError) throw incomeError

        setTotalIncome(incomeData || 0)

        // Fetch total expense
        const { data: expenseData, error: expenseError } = await supabase.rpc("get_total_expense")

        if (expenseError) throw expenseError

        setTotalExpense(expenseData || 0)

        // Fetch monthly data
        const { data: monthlyData, error: monthlyError } = await supabase.rpc("get_monthly_statistics")

        if (monthlyError) throw monthlyError

        setMonthlyData(monthlyData || [])

        // Fetch unpaid amount for the current user
        if (user.role !== "admin") {
          const { data: unpaidData, error: unpaidError } = await supabase.rpc("calculate_unpaid_amount", {
            student_id_param: user.id,
          })

          if (unpaidError) throw unpaidError
          setUnpaidAmount(unpaidData || 0)
        }
      } catch (error) {
        console.error("Error fetching statistics data:", error)
        toast.error("Gagal memuat data statistik")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStatisticsData()
    } else if (authChecked && !loading) {
      setIsLoading(false)
    }
  }, [user, authChecked, loading])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Show loading state while checking auth
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    )
  }

  // If not authenticated after checking, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-white">Statistik</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0 dark:bg-[#00B894]/10">
          <h2 className="text-white/70 mb-2">Total Pemasukan</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0 dark:bg-[#00B894]/10">
          <h2 className="text-white/70 mb-2">Total Pengeluaran</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</p>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>

        {user && user.role !== "admin" && unpaidAmount !== null && unpaidAmount > 0 && (
          <Card className="p-4 bg-amber-500/20 backdrop-blur-sm border-0 dark:bg-amber-500/10">
            <h2 className="text-white/70 mb-2">Tunggakan Kas Mingguan</h2>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-white">{formatCurrency(unpaidAmount)}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-accent hover:bg-accent/90 text-white"
                size="sm"
              >
                Bayar Sekarang
              </Button>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => router.push("/weekly-payments")} className="bg-accent hover:bg-accent/90 text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Lihat Kas Mingguan
          </Button>
        </div>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-white mb-4">Riwayat Bulanan</h2>
          <div className="space-y-4">
            {monthlyData.length > 0 ? (
              monthlyData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0"
                >
                  <p className="text-white">{item.month}</p>
                  <p className="text-green-500">{formatCurrency(item.income)}</p>
                </div>
              ))
            ) : (
              <p className="text-white/70 text-center py-4">Belum ada data bulanan</p>
            )}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
