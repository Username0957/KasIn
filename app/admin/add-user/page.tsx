"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function AddUserPage() {
  const { isAdmin, loading, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Form state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [kelas, setKelas] = useState("")
  const [nis, setNis] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Anda tidak memiliki akses admin")
      router.push("/dashboard")
    }
  }, [loading, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password || !fullName) {
      toast.error("Username, password, dan nama lengkap harus diisi")
      return
    }

    // Jika role adalah user, kelas dan NIS harus diisi
    if (role === "user" && (!kelas || !nis)) {
      toast.error("Kelas dan NIS harus diisi untuk akun siswa")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan")
        return
      }

      const response = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
          fullName,
          kelas: role === "admin" ? null : kelas,
          nis: role === "admin" ? null : nis,
          role,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Pengguna berhasil ditambahkan")
        // Reset form
        setUsername("")
        setPassword("")
        setFullName("")
        setKelas("")
        setNis("")
        setRole("user")
      } else {
        toast.error(data.message || "Gagal menambahkan pengguna")
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Terjadi kesalahan saat menambahkan pengguna")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    )
  }

  // If not admin, don't render anything (redirect will happen)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white\">Mengalihkan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-white"
            onClick={() => router.push("/admin/transactions")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Image src="/logo.svg" alt="KasIn Logo" width={100} height={40} className="h-8 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-white">Tambah Pengguna</h1>
      </header>

      <main className="p-4">
        <Card className="p-6 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Username"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Password"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullName" className="text-white">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Nama Lengkap"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as "admin" | "user")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="user"
                      id="user"
                      className="border-white/20 text-accent"
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="user" className="text-white">
                      Siswa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="admin"
                      id="admin"
                      className="border-white/20 text-accent"
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="admin" className="text-white">
                      Admin
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {role === "user" && (
                <>
                  <div>
                    <Label htmlFor="kelas" className="text-white">
                      Kelas
                    </Label>
                    <Input
                      id="kelas"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Contoh: X PPLG 1"
                      disabled={isSubmitting}
                      required={role === "user"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nis" className="text-white">
                      NIS
                    </Label>
                    <Input
                      id="nis"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Nomor Induk Siswa"
                      disabled={isSubmitting}
                      required={role === "user"}
                    />
                  </div>
                </>
              )}
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  MENYIMPAN...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  SIMPAN
                </>
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
