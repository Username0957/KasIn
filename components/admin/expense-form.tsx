"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; description: string }) => Promise<void>
  onCancel: () => void
}

export function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate input
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Jumlah pengeluaran harus berupa angka positif")
      return
    }

    if (!description.trim()) {
      toast.error("Deskripsi pengeluaran tidak boleh kosong")
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({
        amount: Number(amount),
        description: description.trim(),
      })

      // Reset form
      setAmount("")
      setDescription("")
    } catch (error) {
      console.error("Error submitting expense:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah Pengeluaran (Rp)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Contoh: 50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Pengeluaran</Label>
        <Textarea
          id="description"
          placeholder="Contoh: Pembelian alat tulis kelas"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isLoading}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Pengeluaran"}
        </Button>
      </div>
    </form>
  )
}
