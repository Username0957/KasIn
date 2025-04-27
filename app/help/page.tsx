"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import BottomNav from "@/components/bottom-nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
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
        <h1 className="text-xl font-bold text-white">Bantuan</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-6 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-white mb-4">Pertanyaan Umum</h2>

          <Accordion type="single" collapsible className="text-white">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-white">Bagaimana cara membayar kas mingguan?</AccordionTrigger>
              <AccordionContent className="text-white/80">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Buka halaman Dashboard</li>
                  <li>Klik tombol + (plus) di pojok kanan bawah</li>
                  <li>Pilih tipe transaksi &quot;Pemasukan&quot;</li>
                  <li>Masukkan jumlah pembayaran (harus kelipatan Rp5.000)</li>
                  <li>Tambahkan deskripsi seperti &quot;Pembayaran Kas Mingguan&quot;</li>
                  <li>Klik tombol &quot;Simpan&quot;</li>
                  <li>Tunggu persetujuan dari admin</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-white">Bagaimana cara mengganti password?</AccordionTrigger>
              <AccordionContent className="text-white/80">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Buka halaman Pengaturan</li>
                  <li>Pada bagian Akun, klik ikon pena di sebelah Password</li>
                  <li>Masukkan password saat ini</li>
                  <li>Masukkan password baru</li>
                  <li>Konfirmasi password baru</li>
                  <li>Klik tombol &quot;Simpan&quot;</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-white">Bagaimana cara mengganti username?</AccordionTrigger>
              <AccordionContent className="text-white/80">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Buka halaman Pengaturan</li>
                  <li>Pada bagian Akun, klik ikon pena di sebelah Username</li>
                  <li>Masukkan username baru</li>
                  <li>Klik tombol &quot;Simpan&quot;</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-white">Bagaimana cara melihat riwayat transaksi?</AccordionTrigger>
              <AccordionContent className="text-white/80">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Buka halaman Profil</li>
                  <li>Klik tombol &quot;Lihat Riwayat Transaksi Saya&quot;</li>
                  <li>Anda akan melihat daftar semua transaksi yang pernah Anda lakukan</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-white">
                Bagaimana cara melihat status pembayaran mingguan?
              </AccordionTrigger>
              <AccordionContent className="text-white/80">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Buka halaman Statistik</li>
                  <li>Klik tombol &quot;Lihat Kas Mingguan&quot;</li>
                  <li>Anda akan melihat daftar pembayaran mingguan beserta statusnya</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
