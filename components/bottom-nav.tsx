"use client"

import { Home, BarChart2, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#00B894] py-2">
      <div className="flex justify-around items-center">
        <Link
          href="/dashboard"
          className={cn("flex flex-col items-center p-2 text-white/70", pathname === "/dashboard" && "text-white")}
        >
          <Home className="h-6 w-6" />
        </Link>
        <Link
          href="/statistics"
          className={cn("flex flex-col items-center p-2 text-white/70", pathname === "/statistics" && "text-white")}
        >
          <BarChart2 className="h-6 w-6" />
        </Link>
        <Link
          href="/profile"
          className={cn("flex flex-col items-center p-2 text-white/70", pathname === "/profile" && "text-white")}
        >
          <User className="h-6 w-6" />
        </Link>
        <Link
          href="/settings"
          className={cn("flex flex-col items-center p-2 text-white/70", pathname === "/settings" && "text-white")}
        >
          <Settings className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  )
}

