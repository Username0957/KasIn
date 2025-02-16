import BottomNav from "@/components/bottom-nav"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Bell, Moon, HelpCircle, Info } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="p-4 flex items-center justify-between">
        <Image src="/placeholder.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-white">Pengaturan</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-white/70" />
                <p className="text-white">Notifikasi</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="w-5 h-5 text-white/70" />
                <p className="text-white">Mode Gelap</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-white/70" />
                <p className="text-white">Bantuan</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-white/70" />
                <p className="text-white">Tentang Aplikasi</p>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-center text-white/50 text-sm">Versi Aplikasi 1.0.0</p>
      </main>

      <BottomNav />
    </div>
  )
}

