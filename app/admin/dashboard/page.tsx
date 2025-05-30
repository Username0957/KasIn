"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { TransactionTable } from "@/components/admin/transaction-table"
import { ExpenseForm } from "@/components/admin/expense-form"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [approvedTransactions, setApprovedTransactions] = useState([])
  const [rejectedTransactions, setRejectedTransactions] = useState([])
  const [totalKas, setTotalKas] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      setIsLoading(true)
      try {
        // Cek token dari localStorage atau sessionStorage
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
        if (!token) {
          router.push("/admin-login")
          return
        }

        // Verifikasi token admin dengan API
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to verify admin token")
        }

        const data = await response.json()
        if (!data.success || data.user?.role !== "admin") {
          throw new Error("Not authenticated as admin")
        }

        // Jika berhasil, lanjutkan fetch data dashboard
        fetchDashboardData()
      } catch (error) {
        console.error("Admin auth error:", error)
        toast.error("Sesi admin tidak valid. Silakan login kembali.")
        router.push("/admin-login")
      }
    }

    checkAdminAuth()
  }, [router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      // Fetch pending transactions
      const pendingResponse = await fetch("/api/admin/transactions?status=pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch approved transactions
      const approvedResponse = await fetch("/api/admin/transactions?status=approved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch rejected transactions
      const rejectedResponse = await fetch("/api/admin/transactions?status=rejected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch summary data
      const summaryResponse = await fetch("/api/admin/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!pendingResponse.ok || !approvedResponse.ok || !rejectedResponse.ok || !summaryResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const pendingData = await pendingResponse.json()
      const approvedData = await approvedResponse.json()
      const rejectedData = await rejectedResponse.json()
      const summaryData = await summaryResponse.json()

      setPendingTransactions(pendingData.transactions || [])
      setApprovedTransactions(approvedData.transactions || [])
      setRejectedTransactions(rejectedData.transactions || [])
      setTotalKas(summaryData.totalKas || 0)
      setTotalExpense(summaryData.totalExpense || 0)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Gagal memuat data dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransactionAction = async () => {
    // Refresh data after any transaction action
    await fetchDashboardData()
  }

  const handleAddExpense = async (expenseData: { amount: number; description: string }) => {
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      })

      if (!response.ok) {
        throw new Error("Failed to add expense")
      }

      toast.success("Pengeluaran berhasil ditambahkan")
      setShowExpenseForm(false)
      fetchDashboardData()
    } catch (error) {
      console.error("Error adding expense:", error)
      toast.error("Gagal menambahkan pengeluaran")
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl md:text-3xl font-bold">Dashboard Admin</h1>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Kas</CardTitle>
              <CardDescription>Total kas yang terkumpul</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowUpCircle className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{formatRupiah(totalKas)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <CardDescription>Total pengeluaran kas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowDownCircle className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{formatRupiah(totalExpense)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
              <CardDescription>Saldo kas saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{formatRupiah(totalKas - totalExpense)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowExpenseForm(!showExpenseForm)}>
            {showExpenseForm ? "Batal" : "Tambah Pengeluaran"}
          </Button>
        </div>

        {showExpenseForm && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Tambah Pengeluaran</CardTitle>
              <CardDescription>Isi form berikut untuk menambahkan pengeluaran kas</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setShowExpenseForm(false)} />
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Menunggu Persetujuan ({pendingTransactions.length})</TabsTrigger>
              <TabsTrigger value="approved">Disetujui ({approvedTransactions.length})</TabsTrigger>
              <TabsTrigger value="rejected">Ditolak ({rejectedTransactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Menunggu Persetujuan</CardTitle>
                  <CardDescription>Daftar transaksi kas yang menunggu persetujuan admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={pendingTransactions}
                    showActions={true}
                    onApprove={handleTransactionAction}
                    onReject={handleTransactionAction}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved">
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Disetujui</CardTitle>
                  <CardDescription>Daftar transaksi kas yang telah disetujui</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable transactions={approvedTransactions} showActions={false} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected">
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Ditolak</CardTitle>
                  <CardDescription>Daftar transaksi kas yang ditolak</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable transactions={rejectedTransactions} showActions={false} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}
