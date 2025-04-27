"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, ArrowLeft, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionTable } from "@/components/admin/transaction-table"

interface Transaction {
  id: string
  amount: number
  description: string
  type: "income" | "expense"
  status: "pending" | "approved" | "rejected"
  created_at: string
  user_name: string
  user_full_name: string
  user: {
    id: string
    username: string
    full_name: string
    kelas: string
    nis: string
  }
}

export default function AdminTransactionsPage() {
  const { user, loading, refreshUser, isAuthenticated, isAdmin } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Transaction detail dialog
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const checkAuth = useCallback(async () => {
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

      // Jika berhasil, set state dan fetch data
      setAuthChecked(true)
      await refreshUser()
    } catch (error) {
      console.error("Error checking auth:", error)
      toast.error("Sesi admin tidak valid. Silakan login kembali.")
      router.push("/admin-login")
    }
  }, [refreshUser, router])

  // First, check authentication status
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Redirect if not authenticated or not admin after loading
  useEffect(() => {
    if (authChecked && !loading) {
      if (!isAuthenticated) {
        console.log("Admin Transactions - Not authenticated, redirecting to admin login")
        router.push("/admin-login")
      } else if (!isAdmin) {
        console.log("Admin Transactions - Not admin, redirecting to admin login")
        router.push("/admin-login")
        toast.error("Anda tidak memiliki akses admin")
      }
    }
  }, [authChecked, loading, isAuthenticated, isAdmin, router])

  // Fetch transactions data
  const fetchTransactions = useCallback(async () => {
    if (!isAdmin) return

    try {
      setIsLoading(true)
      // Fetch pending transactions with user names
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          user:user_id (
            id,
            username,
            full_name,
            kelas,
            nis
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Gagal memuat data transaksi")
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && authChecked && !loading) {
      fetchTransactions()
    }
  }, [isAdmin, authChecked, loading, fetchTransactions])

  const handleTransactionAction = async () => {
    // Refresh the transactions list after approval/rejection
    await fetchTransactions()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const showTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailOpen(true)
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

  // If not authenticated or not admin after checking, don't render anything (redirect will happen)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Mengalihkan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={() => router.push("/profile")}>
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-6 md:h-8 w-auto" />
        </div>
        <h1 className="text-lg md:text-xl font-bold text-white">Persetujuan Transaksi</h1>
      </header>

      <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 px-4 mt-2 mb-4">
        <Button
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white mb-2 md:mb-0"
          onClick={() => router.push("/admin/add-admin")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Admin
        </Button>
        <Button
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white mb-2 md:mb-0"
          onClick={() => router.push("/admin/add-user")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
        <Button
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => router.push("/admin/users")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Lihat Pengguna
        </Button>
      </div>

      <main className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Transaksi Menunggu Persetujuan</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            showActions={true}
            onApprove={handleTransactionAction}
            onReject={handleTransactionAction}
          />
        )}
      </main>

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#1B2B44] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedTransaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </h3>
                <p
                  className={`font-bold text-lg ${selectedTransaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                >
                  {selectedTransaction.type === "income" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-white/70">Deskripsi</p>
                  <p className="text-white font-medium">{selectedTransaction.description}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Status</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedTransaction.status === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : selectedTransaction.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {selectedTransaction.status === "approved"
                      ? "Disetujui"
                      : selectedTransaction.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Dibuat oleh</p>
                  <p className="text-white">{selectedTransaction.user?.full_name || "Unknown"}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Username</p>
                  <p className="text-white">{selectedTransaction.user?.username || "Unknown"}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Tanggal</p>
                  <p className="text-white">{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setIsDetailOpen(false)} className="bg-accent hover:bg-accent/90">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
