"use client"

import BottomNav from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { User, FileText, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfileData {
  username: string
  full_name: string
  kelas: string
  nis: string
  role: string
}

export default function ProfilePage() {
  const { user, signOut, refreshUser, loading, isAuthenticated, isAdmin } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser()
        setAuthChecked(true)
      } catch (error) {
        console.error("Error checking auth:", error)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [refreshUser])

  useEffect(() => {
    if (authChecked && !loading && !isAuthenticated) {
      console.log("Profile - Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [authChecked, loading, isAuthenticated, router])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("users")
          .select("username, full_name, kelas, nis, role")
          .eq("id", user.id)
          .single()

        if (error) throw error

        setProfileData(data)
      } catch (error) {
        console.error("Error fetching profile data:", error)
        toast.error("Gagal memuat data profil")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    } else if (authChecked && !loading) {
      setIsLoading(false)
    }
  }, [user, authChecked, loading])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Berhasil logout")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Gagal logout")
    }
  }

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-white">Profil</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-2">
            <User className="w-16 h-16 text-[#1B2B44]" />
          </div>
          <h2 className="text-xl font-bold text-white">{profileData?.full_name || "Loading..."}</h2>
          <p className="text-white/70">
            {profileData?.role === "admin" ? "Admin" : "Siswa"}
            {profileData?.role !== "admin" && profileData?.kelas ? ` - ${profileData.kelas}` : ""}
          </p>
        </div>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-white/70" />
                <p className="text-white">Username</p>
              </div>
              <p className="text-white/70">{profileData?.username || "Loading..."}</p>
            </div>
            {profileData?.role !== "admin" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-white/70" />
                    <p className="text-white">Kelas</p>
                  </div>
                  <p className="text-white/70">{profileData?.kelas || "Loading..."}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-white/70" />
                    <p className="text-white">NIS</p>
                  </div>
                  <p className="text-white/70">{profileData?.nis || "Loading..."}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white">Role</p>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">{profileData?.role === "admin" ? "Admin" : "Siswa"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white">Password</p>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">••••••••••••••</p>
                {/* Remove the edit button for password */}
              </div>
            </div>
          </div>
        </Card>

        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => {
            if (profileData?.role === "admin") {
              router.push("/admin/transactions")
            } else {
              router.push("/transaction-history")
            }
          }}
        >
          {profileData?.role === "admin" ? "Lihat Semua Transaksi" : "Lihat Riwayat Transaksi Saya"}
        </Button>

        <Button
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          onClick={handleLogout}
        >
          LOGOUT
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
