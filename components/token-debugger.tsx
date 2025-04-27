"\"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import jwt from "jsonwebtoken"

export function TokenDebugger() {
  const [token, setToken] = useState<string | null>(null)
  const [decodedToken, setDecodedToken] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    setToken(storedToken)

    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken)
        setDecodedToken(decoded)
        setError(null)
      } catch (e) {
        console.error("Error decoding token:", e)
        setError(e instanceof Error ? e.message : String(e))
        setDecodedToken(null)
      }
    } else {
      setDecodedToken(null)
    }
  }, [])

  const refreshToken = () => {
    const storedToken = localStorage.getItem("auth_token")
    setToken(storedToken)

    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken)
        setDecodedToken(decoded)
        setError(null)
      } catch (e) {
        console.error("Error decoding token:", e)
        setError(e instanceof Error ? e.message : String(e))
        setDecodedToken(null)
      }
    } else {
      setDecodedToken(null)
    }
  }

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Token Debugger</h3>
        <Button variant="outline" size="sm" onClick={refreshToken} className="text-xs">
          Refresh
        </Button>
      </div>
      <div className="space-y-2">
        {error && <div className="text-red-500 text-sm">Error: {error}</div>}
        <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
          <p>Token: {token ? `${token.substring(0, 20)}...` : "No token found"}</p>
        </div>
        <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
          <p>Decoded Token: {decodedToken ? JSON.stringify(decodedToken, null, 2) : "No token decoded"}</p>
        </div>
      </div>
    </Card>
  )
}
