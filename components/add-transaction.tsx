"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function AddTransaction() {
  const { user, refreshUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [isLoading, setIsLoading] = useState(false)
  const [unpaidAmount, setUnpaidAmount] = useState<number | null>(null)
  const [isWeeklyPayment, setIsWeeklyPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch unpaid amount for the current user
  const fetchUnpaidAmount = async () => {
    if (!user || user.role === "admin") return

    try {
      const { data, error } = await supabase.rpc("calculate_unpaid_amount", {
        student_id_param: user.id,
      })

      if (error) {
        console.error("Error fetching unpaid amount:", error)
        // Don't throw, just set to 0
        setUnpaidAmount(0)
        return
      }

      setUnpaidAmount(data || 0)
    } catch (error) {
      console.error("Error in fetchUnpaidAmount:", error)
      setUnpaidAmount(0)
    }
  }

  // Refresh user data when component mounts
  useEffect(() => {
    refreshUser()
    if (user) {
      fetchUnpaidAmount()
    }
  }, [refreshUser, user])

  // Fix the description reassignment issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }

    if (!description.trim()) {
      toast.error("Deskripsi tidak boleh kosong")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      // For weekly payments, ensure the amount is a multiple of 5000
      const amountValue = Number.parseFloat(amount)
      if (isWeeklyPayment && amountValue % 5000 !== 0) {
        toast.error("Pembayaran kas mingguan harus kelipatan Rp5.000")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/admin/add-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountValue,
          description: isWeeklyPayment ? `Pembayaran Kas Mingguan: ${description}` : description,
          type: "income",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add transaction")
      }

      toast.success("Transaksi berhasil ditambahkan")
      setAmount("")
      setDescription("")
      setIsWeeklyPayment(false)
      setIsOpen(false)

      // Refresh unpaid amount after successful transaction
      fetchUnpaidAmount()
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error(`Gagal menambahkan transaksi: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-14 h-14 fixed bottom-20 right-4 bg-accent hover:bg-accent/90 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1B2B44] text-white border-white/10 dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Tambah Transaksi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-white">
              Jumlah
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Jumlah"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            {type === "income" && (
              <p className="text-xs text-white/70 mt-1">Jumlah harus kelipatan Rp5.000 untuk pembayaran kas mingguan</p>
            )}
            {type === "income" && unpaidAmount !== null && unpaidAmount > 0 && (
              <p className="text-xs text-amber-400 mt-1">
                Tunggakan kas mingguan Anda: Rp{unpaidAmount.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              placeholder="Deskripsi transaksi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div>
            <Label className="text-white">Tipe Transaksi</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as "income" | "expense")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" className="border-white/20 text-accent" />
                <Label htmlFor="income" className="text-white">
                  Pemasukan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" className="border-white/20 text-accent" />
                <Label htmlFor="expense" className="text-white">
                  Pengeluaran
                </Label>
              </div>
            </RadioGroup>
          </div>

          {type === "income" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isWeeklyPayment"
                checked={isWeeklyPayment}
                onChange={(e) => setIsWeeklyPayment(e.target.checked)}
                className="rounded border-white/20 text-accent"
              />
              <Label htmlFor="isWeeklyPayment" className="text-white">
                Ini adalah pembayaran kas mingguan
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                LOADING...
              </>
            ) : (
              "SIMPAN"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
