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

  // Refresh user data when component mounts
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Anda harus login untuk menambahkan transaksi")
      return
    }

    if (!amount || !description) {
      toast.error("Semua field harus diisi")
      return
    }

    setIsLoading(true)

    try {
      // Insert transaction directly into the transactions table
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: Number.parseFloat(amount),
        description,
        type,
        status: "pending", // All transactions start as pending and need admin approval
      })

      if (error) throw error

      toast.success("Transaksi berhasil ditambahkan dan menunggu persetujuan admin")
      setAmount("")
      setDescription("")
      setType("income")
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error("Gagal menambahkan transaksi")
    } finally {
      setIsLoading(false)
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

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
            {isLoading ? (
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

