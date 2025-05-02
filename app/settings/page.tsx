"use client"

import BottomNav from "@/components/bottom-nav"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Bell, Moon, HelpCircle, Info, User, Lock, Loader2, Save, X, Pen } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { comparePassword, hashPassword } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { user, refreshUser, isAuthenticated, loading } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Username change state
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [isChangingUsername, setIsChangingUsername] = useState(false)

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // First, check authentication status
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

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (authChecked && !loading && !isAuthenticated) {
      console.log("Settings - Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [authChecked, loading, isAuthenticated, router])

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) return

      try {
        // Check if profiles table exists and has notifications_enabled field
        const { data, error } = await supabase
          .from("profiles")
          .select("notifications_enabled")
          .eq("user_id", user.id)
          .single()

        if (!error && data) {
          setNotificationsEnabled(data.notifications_enabled || false)
        } else {
          // If profiles table doesn't exist or has no record for this user, create one
          try {
            await supabase.from("profiles").upsert({
              user_id: user.id,
              notifications_enabled: false,
            })
          } catch (e) {
            console.error("Error creating profile:", e)
          }
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error)
      }
    }

    if (user) {
      fetchNotificationSettings()
    }
  }, [user])

  const handleNotificationToggle = async (checked: boolean) => {
    setNotificationsEnabled(checked)

    if (user) {
      try {
        // First check if a profile already exists
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()

        if (existingProfile) {
          // If profile exists, update it
          const { error } = await supabase
            .from("profiles")
            .update({ notifications_enabled: checked })
            .eq("user_id", user.id)

          if (error) throw error
        } else {
          // If profile doesn't exist, insert a new one
          const { error } = await supabase.from("profiles").insert({
            user_id: user.id,
            notifications_enabled: checked,
          })

          if (error) throw error
        }

        toast.success(checked ? "Notifikasi diaktifkan" : "Notifikasi dinonaktifkan")
      } catch (error) {
        console.error("Error updating notification settings:", error)
        toast.error("Gagal memperbarui pengaturan notifikasi")
        // Revert the UI state if the update failed
        setNotificationsEnabled(!checked)
      }
    }
  }

  const handleChangeUsername = async () => {
    setUsernameError("")

    if (!newUsername) {
      setUsernameError("Username baru harus diisi")
      return
    }

    setIsChangingUsername(true)

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", newUsername)
        .single()

      if (existingUser) {
        setUsernameError("Username sudah digunakan")
        setIsChangingUsername(false)
        return
      }

      // Update the username
      const { error: updateError } = await supabase.from("users").update({ username: newUsername }).eq("id", user?.id)

      if (updateError) throw updateError

      toast.success("Username berhasil diubah")
      setIsUsernameDialogOpen(false)
      setNewUsername("")

      // Refresh user data
      await refreshUser()
    } catch (error) {
      console.error("Error changing username:", error)
      setUsernameError("Gagal mengubah username")
    } finally {
      setIsChangingUsername(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua field harus diisi")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru dan konfirmasi tidak cocok")
      return
    }

    setIsChangingPassword(true)

    try {
      // First, verify current password
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("password")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      const isPasswordValid = await comparePassword(currentPassword, userData.password)

      if (!isPasswordValid) {
        setPasswordError("Password saat ini tidak valid")
        setIsChangingPassword(false)
        return
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword)

      // Update the password
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", user?.id)

      if (updateError) throw updateError

      toast.success("Password berhasil diubah")
      setIsPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("Gagal mengubah password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Show loading state while checking auth
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

  // If not authenticated after checking, don't render anything (redirect will happen)
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
        <h1 className="text-xl font-bold text-white">Pengaturan</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-white/70" />
                <p className="text-white">Notifikasi</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="w-5 h-5 text-white/70" />
                <p className="text-white">Mode Gelap</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-white mb-4">Akun</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-white/70" />
                <p className="text-white">Username</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">{user?.username}</p>
                <button onClick={() => setIsUsernameDialogOpen(true)} className="text-white/70 hover:text-white">
                  <Pen className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-white/70" />
                <p className="text-white">Password</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-white/70">••••••••••••••</p>
                <button onClick={() => setIsPasswordDialogOpen(true)} className="text-white/70 hover:text-white">
                  <Pen className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-white/70" />
                <p className="text-white">Bantuan</p>
              </div>
              <Button variant="ghost" size="sm" className="text-white/70" onClick={() => router.push("/help")}>
                Buka
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-white/70" />
                <p className="text-white">Tentang Aplikasi</p>
              </div>
              <Button variant="ghost" size="sm" className="text-white/70" onClick={() => router.push("/about")}>
                Buka
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-white/50 text-sm">Versi Aplikasi 1.7.8</p>
      </main>

      {/* Username Change Dialog */}
      <Dialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
        <DialogContent className="bg-[#1B2B44] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Ubah Username</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {usernameError && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md">{usernameError}</div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Username Baru</label>
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                disabled={isChangingUsername}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUsernameDialogOpen(false)} disabled={isChangingUsername}>
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={handleChangeUsername}
              className="bg-accent hover:bg-accent/90"
              disabled={isChangingUsername}
            >
              {isChangingUsername ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-[#1B2B44] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md">{passwordError}</div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password Saat Ini</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                disabled={isChangingPassword}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password Baru</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                disabled={isChangingPassword}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Konfirmasi Password Baru</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                disabled={isChangingPassword}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isChangingPassword}>
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-accent hover:bg-accent/90"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
