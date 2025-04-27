"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function EnvVerifier() {
  const [isVerifying, setIsVerifying] = useState(false)

  const verifyEnv = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch("/api/verify-env")
      const data = await response.json()

      if (data.status === "success") {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to verify environment variable")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Button onClick={verifyEnv} disabled={isVerifying}>
      {isVerifying ? "Verifying..." : "Verify Environment Variable"}
    </Button>
  )
}
