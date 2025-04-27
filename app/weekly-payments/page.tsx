"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { WeeklyPaymentTable } from "@/components/weekly-payment-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import BottomNav from "@/components/bottom-nav"

interface Student {
  id: string
  username: string
  full_name: string
  kelas: string
  nis: string
}

interface WeeklyPayment {
  id: string
  month: number
  year: number
  week_number: number
  student_id: string
  payment_status: "belum dibayar" | "lunas"
  week_start_date: string
  week_end_date: string
  paid_at: string | null
  student: Student
}

export default function WeeklyPaymentsPage() {
  const { user, loading, refreshUser, isAuthenticated, isAdmin } = useAuth()
  const [payments, setPayments] = useState<WeeklyPayment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Filter state
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [unpaidAmount, setUnpaidAmount] = useState<number | null>(null)

  // Generate dialog state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generateYear, setGenerateYear] = useState<string>(new Date().getFullYear().toString())
  const [generateMonth, setGenerateMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [isGenerating, setIsGenerating] = useState(false)

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
      console.log("Weekly Payments - Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [authChecked, loading, isAuthenticated, router])

  // Fetch students if admin
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isAdmin) return

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, full_name, kelas, nis")
          .eq("role", "user")
          .order("full_name", { ascending: true })

        if (error) throw error
        setStudents(data || [])
      } catch (error) {
        console.error("Error fetching students:", error)
        toast.error("Gagal memuat data siswa")
      }
    }

    if (isAdmin && authChecked && !loading) {
      fetchStudents()
    }
  }, [isAdmin, authChecked, loading])

  // Fetch weekly payments
  const fetchWeeklyPayments = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan")
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (selectedStudent) {
        params.append("studentId", selectedStudent)
      }
      if (selectedYear) {
        params.append("year", selectedYear)
      }
      if (selectedMonth) {
        params.append("month", selectedMonth)
      }
      if (selectedStatus) {
        params.append("status", selectedStatus)
      }

      const response = await fetch(`/api/weekly-payments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch weekly payments")
      }

      const data = await response.json()
      setPayments(data.payments || [])
      setUnpaidAmount(data.unpaidAmount)
    } catch (error) {
      console.error("Error fetching weekly payments:", error)
      toast.error("Gagal memuat data pembayaran mingguan")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && authChecked && !loading && user) {
      fetchWeeklyPayments()
    }
  }, [isAuthenticated, authChecked, loading, user, selectedStudent, selectedYear, selectedMonth, selectedStatus])

  const handleGenerateEntries = async () => {
    if (!isAdmin) return

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan")
        return
      }

      const year = Number.parseInt(generateYear)
      const month = Number.parseInt(generateMonth)
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        toast.error("Tahun dan bulan tidak valid")
        return
      }

      const response = await fetch("/api/weekly-payments/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year,
          month,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate entries")
      }

      const data = await response.json()
      toast.success(data.message)
      setIsGenerateDialogOpen(false)
      fetchWeeklyPayments()
    } catch (error) {
      console.error("Error generating entries:", error)
      toast.error("Gagal membuat entri pembayaran mingguan")
    } finally {
      setIsGenerating(false)
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={() => router.push("/statistics")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-white">Kas Mingguan</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Filter</h2>
              <Button variant="ghost" size="sm" onClick={fetchWeeklyPayments} className="text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdmin && (
                <div>
                  <Label htmlFor="student" className="text-white">
                    Siswa
                  </Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Pilih siswa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Siswa</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.kelas})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="year" className="text-white">
                  Tahun
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="month" className="text-white">
                  Bulan
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bulan</SelectItem>
                    <SelectItem value="1">Januari</SelectItem>
                    <SelectItem value="2">Februari</SelectItem>
                    <SelectItem value="3">Maret</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">Mei</SelectItem>
                    <SelectItem value="6">Juni</SelectItem>
                    <SelectItem value="7">Juli</SelectItem>
                    <SelectItem value="8">Agustus</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">Oktober</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">Desember</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-white">
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="belum dibayar">Belum Dibayar</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {selectedStudent && unpaidAmount !== null && (
          <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">Total Tunggakan</h3>
                <p className="text-white/70 text-sm">
                  {unpaidAmount > 0
                    ? `Masih ada tunggakan sebesar ${formatCurrency(unpaidAmount)}`
                    : "Tidak ada tunggakan"}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Silahkan lakukan pembayaran melalui halaman dashboard</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Riwayat Pembayaran</h2>
          <div className="flex space-x-2">
            {isAdmin && (
              <Button
                onClick={() => setIsGenerateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Generate Entri
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <WeeklyPaymentTable payments={payments} />
        )}
      </main>

      {/* Generate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="bg-[#1B2B44] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Generate Entri Pembayaran</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="generateYear" className="text-white">
                Tahun
              </Label>
              <Select value={generateYear} onValueChange={setGenerateYear}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="generateMonth" className="text-white">
                Bulan
              </Label>
              <Select value={generateMonth} onValueChange={setGenerateMonth}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Januari</SelectItem>
                  <SelectItem value="2">Februari</SelectItem>
                  <SelectItem value="3">Maret</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">Mei</SelectItem>
                  <SelectItem value="6">Juni</SelectItem>
                  <SelectItem value="7">Juli</SelectItem>
                  <SelectItem value="8">Agustus</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">Oktober</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">Desember</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-white/70 text-sm">
              Ini akan membuat entri pembayaran mingguan untuk semua siswa pada bulan yang dipilih. Entri yang sudah ada
              tidak akan dibuat ulang.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} disabled={isGenerating}>
              Batal
            </Button>
            <Button onClick={handleGenerateEntries} className="bg-accent hover:bg-accent/90" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
