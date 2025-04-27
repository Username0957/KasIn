"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

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

interface WeeklyPaymentTableProps {
  payments: WeeklyPayment[]
}

export function WeeklyPaymentTable({ payments }: WeeklyPaymentTableProps) {
  const getMonthName = (month: number) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]
    return months[month - 1] || month
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (!payments || payments.length === 0) {
    return (
      <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
        <p className="text-center text-white/70 py-4">Tidak ada data pembayaran</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Bulan</TableHead>
              <TableHead className="text-white">Minggu</TableHead>
              <TableHead className="text-white">Periode</TableHead>
              <TableHead className="text-white">Siswa</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Tanggal Bayar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-white">
                  {getMonthName(payment.month)} {payment.year}
                </TableCell>
                <TableCell className="text-white">Minggu {payment.week_number}</TableCell>
                <TableCell className="text-white">
                  {formatDate(payment.week_start_date)} - {formatDate(payment.week_end_date)}
                </TableCell>
                <TableCell className="text-white">
                  {payment.student?.full_name || "Unknown"} ({payment.student?.kelas || "N/A"})
                </TableCell>
                <TableCell>
                  {payment.payment_status === "lunas" ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>Lunas</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <XCircle className="mr-1 h-4 w-4" />
                      <span>Belum Dibayar</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-white">{payment.paid_at ? formatDate(payment.paid_at) : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
