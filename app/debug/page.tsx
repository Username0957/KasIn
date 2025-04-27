"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/session")
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      console.error("Error checking session:", error)
      setSessionData({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-[#1B2B44] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card/10 backdrop-blur-sm border-0">
        <h1 className="text-2xl font-bold text-white mb-6">Session Debug</h1>

        <Button
          onClick={checkSession}
          className="w-full bg-accent hover:bg-accent/90 text-white mb-6"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Session"}
        </Button>

        <div className="bg-black/30 p-4 rounded-md overflow-auto max-h-96">
          <pre className="text-white text-xs whitespace-pre-wrap">
            {sessionData ? JSON.stringify(sessionData, null, 2) : "Loading..."}
          </pre>
        </div>

        <div className="mt-6 flex space-x-4">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            Go to Dashboard
          </Button>
          <Button onClick={() => (window.location.href = "/login")} className="flex-1 bg-gray-500 hover:bg-gray-600">
            Go to Login
          </Button>
        </div>
      </Card>
    </div>
  )
}
