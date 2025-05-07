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

    // Get request body
    const body = await req.json()
    const { transactionId, action } = body

    if (!transactionId || !action) {
      return NextResponse.json({ success: false, message: "Transaction ID and action are required" }, { status: 400 })
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, message: "Action must be either 'approve' or 'reject'" },
        { status: 400 },
      )
    }

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update({ status: action === "approve" ? "approved" : "rejected" })
      .eq("id", transactionId)
      .select()

    if (error) {
      console.error("Error updating transaction:", error)
      return NextResponse.json(
        { success: false, message: `Failed to ${action} transaction: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${action === "approve" ? "approved" : "rejected"} successfully`,
      transaction: data[0],
    })
  } catch (error) {
    console.error("Error in simple-update API:", error)
    return NextResponse.json(
      { success: false, message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
