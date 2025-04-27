"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, ArrowLeft, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Transaction {
  id: string
  amount: number
  description: string
  type: "income" | "expense"
  status: "pending" | "approved" | "rejected"
  created_at: string
  user_name: string
  user_full_name: string
  user_id: string
}

export default function TransactionHistoryPage() {
  const { user, loading, refreshUser, isAuthenticated, isAdmin } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Transaction detail dialog
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
      console.log("Transaction History - Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [authChecked, loading, isAuthenticated, router])

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let query = supabase.from("transactions_with_user_names").select("*").order("created_at", { ascending: false })

        // If user is not an admin, filter transactions to only show their own
        if (user && !isAdmin) {
          query = query.eq("user_id", user.id)
        }

        const { data, error } = await query

        if (error) throw error
        setTransactions(data || [])
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast.error("Gagal memuat data transaksi")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && authChecked && !loading && user) {
      fetchTransactions()
    }
  }, [isAuthenticated, authChecked, loading, user, isAdmin])

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
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={() => router.push("/profile")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-white">{isAdmin ? "Semua Transaksi" : "Riwayat Transaksi Saya"}</h1>
      </header>

      <main className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">{isAdmin ? "Semua Transaksi" : "Transaksi Saya"}</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className={`p-4 border-0 ${
                  transaction.type === "income"
                    ? "bg-green-500/10 dark:bg-green-500/5"
                    : "bg-red-500/10 dark:bg-red-500/5"
                }`}
                onClick={() => showTransactionDetail(transaction)}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <p className="text-sm text-white/70">
                        {new Date(transaction.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : transaction.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {transaction.status === "approved"
                          ? "Disetujui"
                          : transaction.status === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center text-sm text-white/70">
                      <Info className="h-4 w-4 mr-1" />
                      <span>Oleh: {transaction.user_full_name}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
            <p className="text-center text-white/70 py-4">
              {isAdmin ? "Tidak ada transaksi" : "Anda belum memiliki transaksi"}
            </p>
          </Card>
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

                {isAdmin && (
                  <>
                    <div className="flex justify-between">
                      <p className="text-white/70">Dibuat oleh</p>
                      <p className="text-white">{selectedTransaction.user_full_name}</p>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-white/70">Username</p>
                      <p className="text-white">{selectedTransaction.user_name}</p>
                    </div>
                  </>
                )}

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
