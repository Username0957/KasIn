"use client"

import type React from "react"
import { useState } from "react"

// Update the form component to include validation
export function ExpenseForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({ amount: "", description: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({ amount: "", description: "" })

    // Validate inputs
    let hasError = false
    if (!amount || Number.parseFloat(amount) <= 0) {
      setErrors((prev) => ({ ...prev, amount: "Jumlah pengeluaran harus lebih dari 0" }))
      hasError = true
    }

    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: "Deskripsi pengeluaran tidak boleh kosong" }))
      hasError = true
    }

    if (hasError) return

    setIsSubmitting(true)

    // Convert amount to number
    const amountNumber = Number.parseFloat(amount.replace(/\./g, "").replace(/,/g, "."))

    onSubmit({
      amount: amountNumber,
      description: description.trim(),
    })

    setIsSubmitting(false)
  }

  // Format currency input
  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "")

    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatCurrency(value))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Jumlah Pengeluaran
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">Rp</span>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className={`pl-10 w-full rounded-md border ${
                errors.amount ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-sm`}
              placeholder="0"
            />
          </div>
          {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
        </div>
        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Deskripsi
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full rounded-md border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm`}
            placeholder="Deskripsi pengeluaran"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </form>
  )
}
