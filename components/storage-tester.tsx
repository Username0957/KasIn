"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function StorageTester() {
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean | null>(null)
  const [cookiesAvailable, setCookiesAvailable] = useState<boolean | null>(null)
  const [testValue, setTestValue] = useState("")
  const [savedValue, setSavedValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Periksa ketersediaan localStorage dan cookies
  useEffect(() => {
    // Periksa localStorage
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      setLocalStorageAvailable(true)
    } catch (e) {
      console.error("localStorage tidak tersedia:", e)
      setLocalStorageAvailable(false)
      setError(`localStorage error: ${e instanceof Error ? e.message : String(e)}`)
    }

    // Periksa cookies
    try {
      document.cookie = "__test__=1"
      setCookiesAvailable(document.cookie.indexOf("__test__") !== -1)
      document.cookie = "__test__=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    } catch (e) {
      console.error("cookies tidak tersedia:", e)
      setCookiesAvailable(false)
      setError(`cookies error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [])

  // Simpan nilai ke localStorage
  const saveToLocalStorage = () => {
    if (!testValue) return

    try {
      localStorage.setItem("test_value", testValue)
      setSavedValue(localStorage.getItem("test_value"))
      setError(null)
    } catch (e) {
      console.error("Error menyimpan ke localStorage:", e)
      setError(`Error menyimpan: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Simpan nilai ke cookies
  const saveToCookie = () => {
    if (!testValue) return

    try {
      document.cookie = `test_value=${testValue}; path=/; max-age=3600`

      // Periksa apakah cookie berhasil disimpan
      const cookies = document.cookie.split(";")
      let found = false
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        if (cookie.startsWith("test_value=")) {
          setSavedValue(cookie.substring("test_value=".length, cookie.length))
          found = true
          break
        }
      }

      if (!found) {
        setError("Cookie tidak berhasil disimpan")
      } else {
        setError(null)
      }
    } catch (e) {
      console.error("Error menyimpan ke cookie:", e)
      setError(`Error menyimpan cookie: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Hapus nilai
  const clearValue = () => {
    try {
      localStorage.removeItem("test_value")
      document.cookie = "test_value=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      setSavedValue(null)
      setError(null)
    } catch (e) {
      console.error("Error menghapus nilai:", e)
      setError(`Error menghapus: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50 mt-4">
      <h3 className="text-white font-medium mb-4">Storage Tester</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white/70">localStorage:</span>
          <span className={`text-sm ${localStorageAvailable ? "text-green-400" : "text-red-400"}`}>
            {localStorageAvailable === null ? "Checking..." : localStorageAvailable ? "Available" : "Not Available"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/70">Cookies:</span>
          <span className={`text-sm ${cookiesAvailable ? "text-green-400" : "text-red-400"}`}>
            {cookiesAvailable === null ? "Checking..." : cookiesAvailable ? "Available" : "Not Available"}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md text-sm">{error}</div>
        )}

        <div className="flex space-x-2">
          <Input
            type="text"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Nilai untuk disimpan"
            className="bg-white/10 border-white/20 text-white"
          />
          <Button onClick={saveToLocalStorage} size="sm" className="bg-blue-500 hover:bg-blue-600">
            Simpan ke localStorage
          </Button>
          <Button onClick={saveToCookie} size="sm" className="bg-green-500 hover:bg-green-600">
            Simpan ke Cookie
          </Button>
        </div>

        {savedValue && (
          <div className="bg-green-500/20 border border-green-500/50 text-white p-3 rounded-md">
            <p className="text-sm">
              Nilai tersimpan: <span className="font-mono">{savedValue}</span>
            </p>
          </div>
        )}

        <Button onClick={clearValue} size="sm" variant="outline" className="text-red-400 border-red-400">
          Hapus Nilai
        </Button>
      </div>
    </Card>
  )
}
