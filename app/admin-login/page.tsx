"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import jwt from "jsonwebtoken"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded && decoded.role === "admin") {
          window.location.href = "/admin/transactions"
        }
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [router])

  // Update the handleSubmit function to ensure only admins can log in

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Verify that the user is actually an admin
        if (data.user && data.user.role === "admin") {
          // Store token in localStorage
          localStorage.setItem("auth_token", data.token)
          toast.success("Login berhasil")

          // Redirect to admin dashboard
          window.location.href = "/admin/dashboard"
        } else {
          toast.error("Akun ini bukan admin")
        }
      } else {
        toast.error(data.message || "Login gagal")
      }
    } catch (error) {
      console.error("Admin login error:", error)
      toast.error("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }

  const debugAdminLogin = async () => {
    try {
      const response = await fetch("/api/debug/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username }),
      })

      const data = await response.json()
      console.log("Debug info:", data)
      toast.info("Lihat console untuk info debug")
    } catch (error) {
      console.error("Debug error:", error)
      toast.error("Error saat debug")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-[#121212]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="KasIn Logo" width={150} height={50} className="h-12 w-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-card/10 p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white" htmlFor="username">
                  Username Admin
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
            </div>
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                LOADING...
              </>
            ) : (
              "LOGIN ADMIN"
            )}
          </Button>
          <Button
            type="button"
            onClick={debugAdminLogin}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isLoading || !username}
          >
            Debug Login
          </Button>
        </form>
      </div>
    </div>
  )
}
