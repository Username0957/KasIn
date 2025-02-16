"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your authentication logic here
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-center">
        <Image src="/placeholder.svg" alt="KasIn Logo" width={150} height={50} className="h-12 w-auto" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-card/10 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white" htmlFor="email">
                Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white" htmlFor="password">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-white">
                Ingat Saya
              </label>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
          LOGIN
        </Button>
      </form>
    </div>
  )
}

