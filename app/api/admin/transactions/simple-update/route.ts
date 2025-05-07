import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json()
    const { transactionId, action } = body

    if (!transactionId || !action) {
      return NextResponse.json({ success: false, message: "Transaction ID and action are required" }, { status: 400 })
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }

    // Simplified update - only change the status
    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", transactionId)
      .select()
      .single()

    if (error) {
      console.error(`Error ${action}ing transaction:`, error)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to ${action} transaction`,
          error: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${action === "approve" ? "approved" : "rejected"} successfully`,
      transaction: data,
    })
  } catch (error) {
    console.error("Error in simple update transaction status API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
