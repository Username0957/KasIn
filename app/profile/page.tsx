import BottomNav from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { User, FileText, Edit2 } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="p-4 flex items-center justify-between">
        <Image src="/placeholder.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-white">Profil</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-2">
            <User className="w-16 h-16 text-[#1B2B44]" />
          </div>
          <h2 className="text-xl font-bold text-white">M. Hanan Izzaturrofan</h2>
          <p className="text-white/70">Siswa - X PPLG 1</p>
        </div>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-white/70" />
                <p className="text-white">Nama Lengkap</p>
              </div>
              <p className="text-white/70">M. Hanan Izzaturrofan</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-white/70" />
                <p className="text-white">Kelas</p>
              </div>
              <p className="text-white/70">X PPLG 1</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-white/70" />
                <p className="text-white">NIS</p>
              </div>
              <p className="text-white/70">17434</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white">Email</p>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">zlatan123@gmail.com</p>
                <Edit2 className="w-4 h-4 text-white/70" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white">Password</p>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">••••••••••••••</p>
                <Edit2 className="w-4 h-4 text-white/70" />
              </div>
            </div>
          </div>
        </Card>

        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Lihat Laporan</Button>

        <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
          LOGOUT
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}

