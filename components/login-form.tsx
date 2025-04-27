"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { storeToken } from "@/lib/simple-storage"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Login Form - Attempting login with remember me:", rememberMe)

      // Gunakan fungsi login dari auth context dengan parameter rememberMe
      const result = await login(username, password, rememberMe)

      if (result.success) {
        console.log("Login Form - Login successful")

        // Check if user is admin - if so, show error
        if (result.user?.role === "admin") {
          toast.error("Admin tidak dapat login melalui halaman ini. Silakan gunakan halaman login admin.")
          setIsLoading(false)
          return
        }

        if (result.token) {
          // Ensure token is stored properly using our utility
          storeToken(result.token)
          console.log("Login Form - Token stored successfully")
        }

        toast.success("Login berhasil")

        // Tambahkan delay kecil untuk memastikan token tersimpan sebelum redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
      } else {
        toast.error(result.message || "Login gagal")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-center">
        <Image src="/logo.svg" alt="KasIn Logo" width={150} height={50} className="h-12 w-auto" />
      </div>

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

            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-white">
                Ingat Saya
              </label>
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
            "LOGIN"
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {process.env.NODE_ENV === "development" && (
          <Link href="/register" className="text-sm text-white hover:underline">
            Belum punya akun? Daftar
          </Link>
        )}
        <div>
          <Link href="/admin-login" className="text-sm text-white hover:underline">
            Login sebagai Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
