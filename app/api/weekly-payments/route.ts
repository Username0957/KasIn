import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

export async function GET(req: NextRequest) {
  try {
    // Verify token
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const status = searchParams.get("status")

    // Build query
    let query = supabase
      .from("weekly_payments")
      .select(`
        *,
        student:student_id (
          id,
          username,
          full_name,
          kelas,
          nis
        )
      `)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("week_number", { ascending: true })

    // Apply filters
    if (studentId) {
      // Check if user is admin or the student themselves
      if (decoded.role !== "admin" && decoded.id !== studentId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
      }
      query = query.eq("student_id", studentId)
    } else if (decoded.role !== "admin") {
      // If not admin and no studentId specified, only show own records
      query = query.eq("student_id", decoded.id)
    }

    if (year) {
      query = query.eq("year", year)
    }

    if (month) {
      query = query.eq("month", month)
    }

    if (status) {
      query = query.eq("payment_status", status)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      console.error("Error fetching weekly payments:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch weekly payments" }, { status: 500 })
    }

    // If studentId is provided, also get the total unpaid amount
    let unpaidAmount = null
    if (studentId) {
      const { data: unpaidData, error: unpaidError } = await supabase.rpc("calculate_unpaid_amount", {
        student_id_param: studentId,
      })

      if (!unpaidError) {
        unpaidAmount = unpaidData
      }
    }

    return NextResponse.json({
      success: true,
      payments: data,
      unpaidAmount,
    })
  } catch (error) {
    console.error("Error in weekly payments API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
