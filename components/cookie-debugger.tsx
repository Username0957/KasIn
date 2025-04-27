"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CookieDebugger() {
  const [cookies, setCookies] = useState<string>("")

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  const refreshCookies = () => {
    setCookies(document.cookie)
  }

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Cookie Debugger</h3>
        <Button variant="outline" size="sm" onClick={refreshCookies} className="text-xs">
          Refresh
        </Button>
      </div>
      <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
        {cookies || "No cookies found"}
      </div>
    </Card>
  )
}
