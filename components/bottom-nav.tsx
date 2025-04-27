"use client"

import { Home, BarChart2, User, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export default function BottomNav() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#00B894] py-2 dark:bg-[#00B894]/80">
      <div className="flex justify-around items-center">
        <Link
          href={isAdmin ? "/admin/dashboard" : "/dashboard"}
          className={cn(
            "flex flex-col items-center p-2 text-white/70",
            (pathname === "/dashboard" || pathname === "/admin/dashboard") && "text-white",
          )}
        >
          <Home className="h-6 w-6" />
        </Link>
        <Link
          href={isAdmin ? "/admin/transactions" : "/statistics"}
          className={cn(
            "flex flex-col items-center p-2 text-white/70",
            (pathname === "/statistics" || pathname === "/admin/transactions") && "text-white",
          )}
        >
          <BarChart2 className="h-6 w-6" />
        </Link>
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className={cn("flex flex-col items-center p-2 text-white/70", pathname === "/admin" && "text-white")}
          >
            <Shield className="h-6 w-6" />
          </Link>
        )}
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
