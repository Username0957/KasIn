"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getTokenFromAnySource } from "@/lib/storage-utils"

export function TokenDebug() {
  const [tokenInfo, setTokenInfo] = useState<{
    sessionStorage: string | null
    localStorage: string | null
    cookie: string | null
    anySource: string | null
  }>({
    sessionStorage: null,
    localStorage: null,
    cookie: null,
    anySource: null,
  })

  const checkToken = () => {
    try {
      // Check sessionStorage
      let sessionToken = null
      try {
        sessionToken = sessionStorage.getItem("auth_token")
      } catch (e) {
        console.error("Error accessing sessionStorage:", e)
      }

      // Check localStorage
      let localToken = null
      try {
        localToken = localStorage.getItem("auth_token")
      } catch (e) {
        console.error("Error accessing localStorage:", e)
      }

      // Check cookies
      let cookieToken = null
      try {
        const cookies = document.cookie.split(";")
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim()
          if (cookie.startsWith("auth_token=")) {
            cookieToken = cookie.substring("auth_token=".length, cookie.length)
            break
          }
        }
      } catch (e) {
        console.error("Error accessing cookies:", e)
      }

      // Check from any source
      const anySourceToken = getTokenFromAnySource()

      setTokenInfo({
        sessionStorage: sessionToken,
        localStorage: localToken,
        cookie: cookieToken,
        anySource: anySourceToken,
      })
    } catch (e) {
      console.error("Error in checkToken:", e)
    }
  }

  useEffect(() => {
    checkToken()
  }, [])

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Token Debug</h3>
        <Button variant="outline" size="sm" onClick={checkToken} className="text-xs">
          Refresh
        </Button>
      </div>
      <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
        <p>
          sessionStorage: {tokenInfo.sessionStorage ? `${tokenInfo.sessionStorage.substring(0, 15)}...` : "Not found"}
        </p>
        <p>localStorage: {tokenInfo.localStorage ? `${tokenInfo.localStorage.substring(0, 15)}...` : "Not found"}</p>
        <p>cookie: {tokenInfo.cookie ? `${tokenInfo.cookie.substring(0, 15)}...` : "Not found"}</p>
        <p>anySource: {tokenInfo.anySource ? `${tokenInfo.anySource.substring(0, 15)}...` : "Not found"}</p>
      </div>
    </Card>
  )
}
