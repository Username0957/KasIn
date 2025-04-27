import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdminToken } from "@/lib/auth-utils"

export async function POST(req: NextRequest) {
  try {
    // Verify admin token
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { year, month } = body

    // Validate input
    if (!year || !month) {
      return NextResponse.json({ success: false, message: "Year and month are required" }, { status: 400 })
    }

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
    console.error("Error in generate weekly payments API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
