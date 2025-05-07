"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, CircleXIcon as XCircle2, Loader2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Define the Transaction interface
interface User {
  id: string
  username: string
  full_name: string
  kelas?: string
  nis?: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  type: "income" | "expense"
  status: "pending" | "approved" | "rejected"
  created_at: string
  user?: User
}

interface TransactionTableProps {
  transactions: Transaction[]
  showActions?: boolean
  onApprove?: (transactionId: string) => void
  onReject?: (transactionId: string) => void
}

export function TransactionTable({ transactions, showActions = false, onApprove, onReject }: TransactionTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString || "Invalid Date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center">
            <AlertCircle className="mr-1 h-4 w-4 text-yellow-500" />
            <span className="text-yellow-500">Menunggu</span>
          </div>
        )
      case "approved":
        return (
          <div className="flex items-center">
            <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-green-500">Disetujui</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center">
            <XCircle2 className="mr-1 h-4 w-4 text-red-500" />
            <span className="text-red-500">Ditolak</span>
          </div>
        )
      default:
        return <span>{status}</span>
    }
  }

  const handleAction = (transaction: Transaction, action: "approve" | "reject") => {
    setSelectedTransaction(transaction)
    setActionType(action)
    setIsDialogOpen(true)
    setDebugInfo(null)
    setShowDebug(false)
  }

  const confirmAction = async () => {
    if (!selectedTransaction) {
      toast.error("Transaksi tidak ditemukan")
      setIsDialogOpen(false)
      return
    }

    setIsLoading(true)
    setDebugInfo(null)

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      // Try multiple endpoints in sequence until one works
      let success = false
      let errorMessage = ""

      // First try: update-status endpoint
      try {
        const response = await fetch("/api/admin/transactions/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId: selectedTransaction.id,
            action: actionType,
          }),
        })

        const data = await response.json()
        if (response.ok && data.success) {
          success = true
        } else {
          errorMessage = data.message || `Failed to ${actionType} transaction`
          setDebugInfo({ endpoint: "update-status", status: response.status, data })
        }
      } catch (error) {
        console.error("First attempt failed:", error)
        errorMessage = error instanceof Error ? error.message : "Unknown error"
        setDebugInfo({ endpoint: "update-status", error: String(error) })
      }

      // Second try: direct endpoint if first attempt failed
      if (!success) {
        try {
          const endpoint =
            actionType === "approve"
              ? `/api/admin/transactions/${selectedTransaction.id}/approve`
              : `/api/admin/transactions/${selectedTransaction.id}/reject`

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await response.json()
          if (response.ok && data.success) {
            success = true
          } else {
            errorMessage = data.message || `Failed to ${actionType} transaction`
            setDebugInfo({ endpoint: "direct", status: response.status, data })
          }
        } catch (error) {
          console.error("Second attempt failed:", error)
          errorMessage = error instanceof Error ? error.message : "Unknown error"
          setDebugInfo({ endpoint: "direct", error: String(error) })
        }
      }

      // Third try: simple-update endpoint if second attempt failed
      if (!success) {
        try {
          const response = await fetch("/api/admin/transactions/simple-update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              transactionId: selectedTransaction.id,
              action: actionType,
            }),
          })

          const data = await response.json()
          if (response.ok && data.success) {
            success = true
          } else {
            errorMessage = data.message || `Failed to ${actionType} transaction`
            setDebugInfo({ endpoint: "simple-update", status: response.status, data })
          }
        } catch (error) {
          console.error("Third attempt failed:", error)
          errorMessage = error instanceof Error ? error.message : "Unknown error"
          setDebugInfo({ endpoint: "simple-update", error: String(error) })
        }
      }

      if (success) {
        toast.success(`Transaksi berhasil ${actionType === "approve" ? "disetujui" : "ditolak"}`)

        // Call the parent component's callback functions if provided
        if (actionType === "approve" && onApprove) {
          onApprove(selectedTransaction.id)
        } else if (actionType === "reject" && onReject) {
          onReject(selectedTransaction.id)
        }

        setIsDialogOpen(false)
      } else {
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error(`Error ${actionType === "approve" ? "approving" : "rejecting"} transaction:`, error)
      toast.error(
        `Gagal ${actionType === "approve" ? "menyetujui" : "menolak"} transaksi: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      setShowDebug(true)
    } finally {
      setIsLoading(false)
      if (!showDebug) {
        setIsDialogOpen(false)
      }
    }
  }

  if (!transactions || transactions.length === 0) {
    return <div className="py-4 text-center text-gray-500">Tidak ada transaksi</div>
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Tanggal</TableHead>
              <TableHead className="whitespace-nowrap">Nama</TableHead>
              <TableHead className="whitespace-nowrap">Kelas</TableHead>
              <TableHead className="whitespace-nowrap">Jumlah</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              {showActions && <TableHead className="whitespace-nowrap">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">{formatDate(transaction.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap">{transaction.user?.full_name || "Unknown"}</TableCell>
                <TableCell className="whitespace-nowrap">{transaction.user?.kelas || "N/A"}</TableCell>
                <TableCell className="whitespace-nowrap">{formatRupiah(transaction.amount)}</TableCell>
                <TableCell className="whitespace-nowrap">{getStatusBadge(transaction.status)}</TableCell>
                {showActions && (
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        className="px-2 py-1 rounded border border-gray-300 text-sm"
                        defaultValue=""
                        onChange={(e) => {
                          const action = e.target.value
                          if (action === "approve" || action === "reject") {
                            handleAction(transaction, action as "approve" | "reject")
                            // Reset select after action
                            e.target.value = ""
                          }
                        }}
                      >
                        <option value="" disabled>
                          Pilih Aksi
                        </option>
                        <option value="approve">Setujui</option>
                        <option value="reject">Tolak</option>
                      </select>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Setujui Transaksi" : "Tolak Transaksi"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Apakah Anda yakin ingin menyetujui transaksi ini?"
                : "Apakah Anda yakin ingin menolak transaksi ini?"}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <p>
                <strong>Nama:</strong> {selectedTransaction.user?.full_name || "Unknown"}
              </p>
              <p>
                <strong>Kelas:</strong> {selectedTransaction.user?.kelas || "N/A"}
              </p>
              <p>
                <strong>Jumlah:</strong> {formatRupiah(selectedTransaction.amount)}
              </p>
              <p>
                <strong>Tanggal:</strong> {formatDate(selectedTransaction.created_at)}
              </p>
            </div>
          )}

          {showDebug && debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
              <p className="font-semibold mb-1">Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : actionType === "approve" ? (
                "Setujui"
              ) : (
                "Tolak"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
