"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("") // Added full name state
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [kelas, setKelas] = useState("")
  const [nis, setNis] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset error state
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      toast.error("Password tidak cocok")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, kelas, nis }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Registration error response:", errorText)

        let errorMessage = "Registrasi gagal"
        try {
          // Try to parse as JSON in case it is valid JSON despite the status code
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          // If it's not valid JSON, use a generic error message
          errorMessage = `Registrasi gagal: ${response.status} ${response.statusText}`
        }

        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success("Registrasi berhasil! Silakan login.")
        router.push("/login")
      } else {
        setError(data.message || "Registrasi gagal")
        toast.error(data.message || "Registrasi gagal")
      }
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = "Terjadi kesalahan saat registrasi"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-center">
        <Image src="/logo.svg" alt="KasIn Logo" width={150} height={50} className="h-12 w-auto" />
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-card/10 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white" htmlFor="username">
                Username
              </label>
              <div className="mt-1">
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Added full name field */}
            <div>
              <label className="text-sm font-medium text-white" htmlFor="fullName">
                Nama Lengkap
              </label>
              <div className="mt-1">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white" htmlFor="password">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white" htmlFor="confirmPassword">
                Konfirmasi Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white" htmlFor="kelas">
                Kelas
              </label>
              <div className="mt-1">
                <Input
                  id="kelas"
                  type="text"
                  placeholder="Contoh: X PPLG 1"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white" htmlFor="nis">
                NIS
              </label>
              <div className="mt-1">
                <Input
                  id="nis"
                  type="text"
                  placeholder="Nomor Induk Siswa"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              LOADING...
            </>
          ) : (
            "DAFTAR"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-white hover:underline">
          Sudah punya akun? Login
        </Link>
      </div>
    </div>
  )
}
