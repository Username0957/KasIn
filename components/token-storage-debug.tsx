"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function TokenStorageDebug() {
  const [debugInfo, setDebugInfo] = useState({
    localStorage: null as string | null,
    sessionStorage: null as string | null,
    cookie: null as string | null,
    storageAvailable: {
      localStorage: false,
      sessionStorage: false,
      cookie: false,
    },
  })

  const checkStorage = () => {
    try {
      // Check localStorage availability
      let localStorageAvailable = false
      let localStorageToken = null
      try {
        const testKey = "__test__"
        localStorage.setItem(testKey, testKey)
        localStorage.removeItem(testKey)
        localStorageAvailable = true
        localStorageToken = localStorage.getItem("auth_token")
      } catch (e) {
        console.error("localStorage not available:", e)
      }

      // Check sessionStorage availability
      let sessionStorageAvailable = false
      let sessionStorageToken = null
      try {
        const testKey = "__test__"
        sessionStorage.setItem(testKey, testKey)
        sessionStorage.removeItem(testKey)
        sessionStorageAvailable = true
        sessionStorageToken = sessionStorage.getItem("auth_token")
      } catch (e) {
        console.error("sessionStorage not available:", e)
      }

      // Check cookie availability
      let cookieAvailable = false
      let cookieToken = null
      try {
        document.cookie = "__test__=1"
        cookieAvailable = document.cookie.indexOf("__test__") !== -1
        document.cookie = "__test__=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        // Try to get auth_token from cookies
        const cookies = document.cookie.split(";")
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim()
          if (cookie.startsWith("auth_token=")) {
            cookieToken = cookie.substring("auth_token=".length, cookie.length)
            break
          }
        }
      } catch (e) {
        console.error("Cookie access error:", e)
      }

      setDebugInfo({
        localStorage: localStorageToken,
        sessionStorage: sessionStorageToken,
        cookie: cookieToken,
        storageAvailable: {
          localStorage: localStorageAvailable,
          sessionStorage: sessionStorageAvailable,
          cookie: cookieAvailable,
        },
      })
    } catch (e) {
      console.error("Error in checkStorage:", e)
    }
  }

  // Test setting token directly
  const testSetToken = () => {
    try {
      const testToken = "test_token_" + Date.now()

      // Try localStorage
      try {
        localStorage.setItem("auth_token", testToken)
        console.log("Test token set in localStorage")
      } catch (e) {
        console.error("Failed to set token in localStorage:", e)
      }

      // Try sessionStorage
      try {
        sessionStorage.setItem("auth_token", testToken)
        console.log("Test token set in sessionStorage")
      } catch (e) {
        console.error("Failed to set token in sessionStorage:", e)
      }

      // Try cookie
      try {
        document.cookie = `auth_token=${testToken}; path=/; max-age=3600`
        console.log("Test token set in cookie")
      } catch (e) {
        console.error("Failed to set token in cookie:", e)
      }

      // Check if token was set
      checkStorage()
    } catch (e) {
      console.error("Error in testSetToken:", e)
    }
  }

  useEffect(() => {
    checkStorage()
  }, [])

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Token Storage Debug</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={checkStorage} className="text-xs">
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={testSetToken} className="text-xs text-green-400">
            Test Set Token
          </Button>
        </div>
      </div>
      <div className="bg-black/30 p-2 rounded text-xs text-white font-mono overflow-x-auto">
        <p>Storage Available:</p>
        <ul className="ml-4 mb-2">
          <li>localStorage: {debugInfo.storageAvailable.localStorage ? "Yes" : "No"}</li>
          <li>sessionStorage: {debugInfo.storageAvailable.sessionStorage ? "Yes" : "No"}</li>
          <li>cookie: {debugInfo.storageAvailable.cookie ? "Yes" : "No"}</li>
        </ul>
        <p>Tokens:</p>
        <ul className="ml-4">
          <li>
            localStorage: {debugInfo.localStorage ? `${debugInfo.localStorage.substring(0, 15)}...` : "Not found"}
          </li>
          <li>
            sessionStorage: {debugInfo.sessionStorage ? `${debugInfo.sessionStorage.substring(0, 15)}...` : "Not found"}
          </li>
          <li>cookie: {debugInfo.cookie ? `${debugInfo.cookie.substring(0, 15)}...` : "Not found"}</li>
        </ul>
      </div>
    </Card>
  )
}
