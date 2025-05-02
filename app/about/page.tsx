"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import BottomNav from "@/components/bottom-nav"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-white">Tentang Aplikasi</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-6 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="flex justify-center mb-6">
            <Image src="/logo.svg" alt="KasIn Logo" width={200} height={80} className="h-16 w-auto" />
          </div>

          <h2 className="text-xl font-bold text-white mb-4">KasIn - Aplikasi Kas Digital</h2>

          <div className="space-y-4 text-white/80">
            <p>
              KasIn adalah aplikasi manajemen kas digital yang dirancang khusus untuk sekolah. Aplikasi ini memudahkan
              pengelolaan keuangan kelas dengan sistem yang transparan dan efisien.
            </p>

            <h3 className="text-lg font-semibold text-white">Fitur Utama</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pencatatan transaksi kas secara digital</li>
              <li>Sistem persetujuan transaksi oleh admin</li>
              <li>Pengelolaan pembayaran kas mingguan</li>
              <li>Notifikasi tunggakan pembayaran</li>
              <li>Statistik keuangan yang komprehensif</li>
              <li>Manajemen pengguna oleh admin</li>
              <li>Mode gelap untuk kenyamanan pengguna</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Teknologi</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Next.js 14 dengan App Router</li>
              <li>Supabase untuk autentikasi dan database</li>
              <li>Tailwind CSS untuk styling</li>
              <li>TypeScript untuk type safety</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Versi</h3>
            <p>Versi 1.7.7\8</p>

            <h3 className="text-lg font-semibold text-white">Kontak</h3>
            <p>Untuk pertanyaan atau bantuan, silakan hubungi admin.</p>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
