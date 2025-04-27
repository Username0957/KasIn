"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DebugStorage() {
  const [token, setToken] = useState<string | null>(null)
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true)
  const [storageError, setStorageError] = useState<string | null>(null)

  // Check if localStorage is available
  useEffect(() => {
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      setStorageAvailable(true)
      setStorageError(null)
    } catch (e) {
      setStorageAvailable(false)
      setStorageError(e instanceof Error ? e.message : String(e))
      console.error("localStorage is not available:", e)
    }
  }, [])

  // Get token from localStorage
  useEffect(() => {
    if (storageAvailable) {
      try {
        const storedToken = localStorage.getItem("auth_token")
        setToken(storedToken)
      } catch (e) {
        console.error("Error accessing localStorage:", e)
        setStorageError(e instanceof Error ? e.message : String(e))
      }
    }
  }, [storageAvailable])

  const refreshToken = () => {
    if (storageAvailable) {
      try {
        const storedToken = localStorage.getItem("auth_token")
        setToken(storedToken)
        console.log("Current token in localStorage:", storedToken ? "Present" : "Not found")
        if (storedToken) {
          console.log("Token preview:", storedToken.substring(0, 20) + "...")
        }
      } catch (e) {
        console.error("Error refreshing token:", e)
        setStorageError(e instanceof Error ? e.message : String(e))
      }
    }
  }

  const clearToken = () => {
    if (storageAvailable) {
      try {
        localStorage.removeItem("auth_token")
        setToken(null)
        console.log("Token cleared from localStorage")
      } catch (e) {
        console.error("Error clearing token:", e)
        setStorageError(e instanceof Error ? e.message : String(e))
      }
    }
  }

  const setTestToken = () => {
    if (storageAvailable) {
      try {
        const testToken = "test_token_" + Date.now()
        localStorage.setItem("auth_token", testToken)
        setToken(testToken)
        console.log("Test token set in localStorage:", testToken)
      } catch (e) {
        console.error("Error setting test token:", e)
        setStorageError(e instanceof Error ? e.message : String(e))
      }
    }
  }

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Storage Debugger</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refreshToken} className="text-xs">
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearToken} className="text-xs text-red-400">
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={setTestToken} className="text-xs text-green-400">
            Test
          </Button>
        </div>
      </div>
      <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
        <p>localStorage available: {storageAvailable ? "Yes" : "No"}</p>
        {storageError && <p className="text-red-400">Error: {storageError}</p>}
        <p>auth_token: {token ? `${token.substring(0, 20)}...` : "Not found"}</p>
      </div>
    </Card>
  )
}
