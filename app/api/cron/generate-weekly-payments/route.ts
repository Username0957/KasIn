import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get current year and month
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // JavaScript months are 0-indexed

    // Generate weekly payment entries
    const { data, error } = await supabase.rpc("generate_weekly_payments", {
      year_param: year,
      month_param: month,
    })

    if (error) {
      console.error("Error generating weekly payments:", error)
      return NextResponse.json({ success: false, message: "Failed to generate weekly payments" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${data} weekly payment entries for ${month}/${year}`,
      entriesGenerated: data,
    })
  } catch (error) {
    console.error("Error in generate weekly payments cron:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
