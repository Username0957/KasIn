"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function SessionStorageDebugger() {
  const [token, setToken] = useState<string | null>(null)
  const [expiry, setExpiry] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  const refreshData = () => {
    try {
      // Get token
      const storedToken = sessionStorage.getItem("auth_token")
      setToken(storedToken)

      // Get expiry
      const expiryTimeStr = sessionStorage.getItem("auth_token_expiry")
      setExpiry(expiryTimeStr)

      if (storedToken && expiryTimeStr) {
        const expiryTime = Number.parseInt(expiryTimeStr, 10)
        const now = Date.now()

        // Check if expired
        setIsExpired(now > expiryTime)

        // Calculate time left
        if (now <= expiryTime) {
          const timeLeftMs = expiryTime - now
          const hours = Math.floor(timeLeftMs / (1000 * 60 * 60))
          const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft("Expired")
        }
      } else {
        setIsExpired(null)
        setTimeLeft(null)
      }
    } catch (e) {
      console.error("Error accessing sessionStorage:", e)
    }
  }

  useEffect(() => {
    refreshData()

    // Refresh every minute to update time left
    const interval = setInterval(refreshData, 60000)
    return () => clearInterval(interval)
  }, [])

  const clearSessionStorage = () => {
    try {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token_expiry")
      refreshData()
    } catch (e) {
      console.error("Error clearing sessionStorage:", e)
    }
  }

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Session Storage Debugger</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData} className="text-xs">
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearSessionStorage} className="text-xs text-red-400">
            Clear
          </Button>
        </div>
      </div>
      <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
        <p>Token: {token ? `${token.substring(0, 20)}...` : "Not found"}</p>
        <p>Expiry: {expiry ? new Date(Number.parseInt(expiry, 10)).toLocaleString() : "Not found"}</p>
        <p>Status: {isExpired === null ? "Unknown" : isExpired ? "Expired" : "Valid"}</p>
        {timeLeft && <p>Time Left: {timeLeft}</p>}
      </div>
    </Card>
  )
}
