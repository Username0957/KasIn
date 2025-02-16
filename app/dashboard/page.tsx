import { Card } from "@/components/ui/card"
import BottomNav from "@/components/bottom-nav"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="p-4">
        <Image src="/placeholder.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0">
          <h2 className="text-white/70 mb-2">Total Saldo</h2>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-white">Rp 1.567.000,00</p>
            <span className="text-red-500 text-sm">-Rp 70.000,00</span>
          </div>
        </Card>

        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0">
          <h2 className="text-white/70 mb-2">Pemasukan Bulan Ini</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">Rp 560.000,00</p>
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0">
          <h2 className="text-white/70 mb-2">Pengeluaran Bulan Ini</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">Rp 70.000,00</p>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <h2 className="text-xl font-bold text-white mb-4">Riwayat Transaksi Total</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border-b border-white/10 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-white font-medium">Pembayaran Kas Mingguan</p>
                    <p className="text-sm text-white/70">Imam H.H</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500">+Rp 5.000,00</p>
                    <p className="text-sm text-white/70">3 Nov 2024</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}

