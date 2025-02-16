import BottomNav from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Image from "next/image"

export default function StatisticsPage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="p-4 flex items-center justify-between">
        <Image src="/placeholder.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-white">Statistik</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0">
          <h2 className="text-white/70 mb-2">Total Pemasukan</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">Rp 2.240.000,00</p>
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0">
          <h2 className="text-white/70 mb-2">Total Pengeluaran</h2>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">Rp 673.000,00</p>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <h2 className="text-xl font-bold text-white mb-4">Riwayat Bulanan</h2>
          <div className="space-y-4">
            {["Januari", "Februari", "Maret", "April"].map((month) => (
              <div
                key={month}
                className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0"
              >
                <p className="text-white">{month}</p>
                <p className="text-green-500">+Rp 560.000,00</p>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}

