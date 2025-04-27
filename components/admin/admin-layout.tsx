"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, Users, LogOut, Menu, X } from "lucide-react"
import { toast } from "sonner"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Ubah fungsi useEffect untuk memeriksa token admin dengan lebih baik
  useEffect(() => {
    // Verify admin token
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
        if (!token) {
          router.push("/admin-login")
          return
        }

        // Decode token to check if user is admin
        try {
          const base64Url = token.split(".")[1]
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
          const payload = JSON.parse(window.atob(base64))

          if (payload.role !== "admin") {
            console.log("Not an admin, redirecting to login")
            localStorage.removeItem("auth_token")
            sessionStorage.removeItem("auth_token")
            router.push("/admin-login")
            return
          }

          // Verify token with API
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to verify admin token")
          }

          const data = await response.json()
          if (!data.success || data.user?.role !== "admin") {
            throw new Error("Not authenticated as admin")
          }

          setIsLoading(false)
        } catch (error) {
          console.error("Error verifying admin token:", error)
          localStorage.removeItem("auth_token")
          sessionStorage.removeItem("auth_token")
          router.push("/admin-login")
        }
      } catch (error) {
        console.error("Admin auth error:", error)
        router.push("/admin-login")
      }
    }

    checkAdminAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_token")
    toast.success("Berhasil logout")
    router.push("/admin-login")
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow dark:bg-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image src="/logo.svg" alt="KasIn Logo" width={120} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden space-x-4 md:flex">
            <Link
              href="/admin/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </span>
            </Link>
            <Link
              href="/admin/transactions"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                Transaksi
              </span>
            </Link>
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Pengguna
              </span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute right-0 h-full w-64 bg-white p-4 shadow-lg dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/admin/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </span>
              </Link>
              <Link
                href="/admin/transactions"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <Receipt className="mr-2 h-4 w-4" />
                  Transaksi
                </span>
              </Link>
              <Link
                href="/admin/users"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Pengguna
                </span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-gray-500 shadow-inner dark:bg-gray-800 dark:text-gray-400">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} KasIn App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
