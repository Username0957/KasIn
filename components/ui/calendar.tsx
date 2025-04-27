"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Simple calendar component that doesn't depend on react-day-picker
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showOutsideDays?: boolean
  classNames?: Record<string, string>
}) {
  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        <Button variant="outline" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="h-8 w-8 flex items-center justify-center">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
            {i + 1 <= 31 ? i + 1 : ""}
          </div>
        ))}
      </div>
    </div>
  )
}
