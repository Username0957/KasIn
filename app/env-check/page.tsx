"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function EnvCheckPage() {
  const [status, setStatus] = useState<Record<string, boolean | string>>({})
  const [loading, setLoading] = useState(false)

  const checkEnvironmentVariables = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/env-check")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error checking environment variables:", error)
      setStatus({ error: "Failed to check environment variables" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1B2B44] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card/10 backdrop-blur-sm border-0">
        <h1 className="text-2xl font-bold text-white mb-6">Environment Variables Check</h1>

        <Button
          onClick={checkEnvironmentVariables}
          className="w-full bg-accent hover:bg-accent/90 text-white mb-6"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Environment Variables"}
        </Button>

        {Object.keys(status).length > 0 && (
          <div className="space-y-2">
            {Object.entries(status).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 rounded bg-white/10">
                <span className="text-white">{key}</span>
                <span className={value === true ? "text-green-500" : "text-red-500"}>
                  {typeof value === "boolean" ? (value ? "✓" : "✗") : value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-white/70 text-sm">
          <p>Make sure the following environment variables are set:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>JWT_SECRET</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
