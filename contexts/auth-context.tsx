"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
// Add import for the simple storage utility
import { getToken, storeToken, clearToken } from "@/lib/simple-storage"

interface User {
  id: string
  username: string
  full_name?: string
  role: "admin" | "user"
  kelas?: string
  nis?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (
    username: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; message: string; user?: User; token?: string }>
  register: (
    username: string,
    password: string,
    fullName: string,
    kelas: string,
    nis: string,
  ) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setIsLoading] = useState(true)
  const [refreshAttempted, setRefreshAttempted] = useState(false)
  const router = useRouter()

  // Perbaiki fungsi refreshUser untuk lebih sederhana
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      let token = getToken()
  
      if (!token) {
        console.log("Auth Context - No token found")
        setUser(null)
        return
      }
  
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      })
  
      if (response.status === 401) {
        console.log("Auth Context - Token expired or unauthorized")
        clearToken()
        setUser(null)
        return
      }
  
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        console.error("Auth Context - Failed to fetch user:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth Context - refreshUser error:", error)
      setUser(null)
    } finally {
      setRefreshAttempted(true)
      setIsLoading(false)
    }
  }, [])
  // Use useCallback to memoize the refreshUser function
  // and prevent unnecessary re-renders  

  // Check if user is logged in on initial load
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      refreshUser()
    }
  }, [refreshUser])

  // Perbaiki fungsi login untuk implementasi "ingat saya"
  const login = async (username: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true)

      console.log("Auth Context - Attempting login for:", username)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ username, password, rememberMe }),
      })

      console.log("Auth Context - Login API response status:", response.status)

      const data = await response.json()
      console.log("Auth Context - Login API response success:", data.success)

      if (data.success && data.user && data.token) {
        console.log("Auth Context - Login successful, setting user data")

        // Simpan token berdasarkan preferensi "ingat saya"
        // Replace with:
        // Store token using our utility
        storeToken(data.token)
        console.log("Auth Context - Token saved to storage")

        setUser(data.user)
      } else {
        console.error("Auth Context - Login failed or no token:", data)
      }

      setIsLoading(false)
      return { success: data.success, message: data.message, user: data.user, token: data.token }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (username: string, password: string, fullName: string, kelas: string, nis: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, kelas, nis }),
      })

      const data = await response.json()
      return { success: data.success, message: data.message }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  // Perbaiki fungsi signOut untuk menghapus token dari semua penyimpanan
  const signOut = async () => {
    try {
      setIsLoading(true)

      // Panggil API logout
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Hapus token dari semua penyimpanan
      // Replace with:
      clearToken()
      console.log("Auth Context - Tokens cleared from storage")

      // Reset state user
      setUser(null)
      setIsLoading(false)

      // Gunakan window.location.href untuk memastikan halaman benar-benar di-refresh
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)

      // Tetap hapus token jika terjadi error
      try {
        localStorage.removeItem("auth_token")
        sessionStorage.removeItem("auth_token")
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      } catch (e) {
        console.error("Error removing tokens:", e)
      }

      setUser(null)
      setIsLoading(false)

      // Gunakan window.location.href untuk memastikan halaman benar-benar di-refresh
      window.location.href = "/login"
    }
  }

  // Add a timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !refreshAttempted) {
        setRefreshAttempted(true)
        setIsLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeoutId)
  }, [loading, refreshAttempted])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading && !refreshAttempted,
        login,
        register,
        signOut,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
