import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

// Pastikan fungsi ini diekspor dengan nama yang benar
export async function GET(req: NextRequest) {
  try {
    // Verify admin token
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get status from query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    // Build query
    let query = supabase.from("transactions").select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          kelas,
          nis
        )
      `)

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Order by created_at desc
    query = query.order("created_at", { ascending: false })

    // Execute query
    const { data: transactions, error } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("Error in admin transactions API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
