import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdminToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { transactionId, status } = body

    // Validate input
    if (!transactionId) {
      return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 })
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = { status }

    if (status === "approved") {
      updateData.approved_by = admin.id
      updateData.approved_at = new Date().toISOString()
    } else if (status === "rejected") {
      updateData.rejected_by = admin.id
      updateData.rejected_at = new Date().toISOString()
    }

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transactionId)
      .eq("status", "pending") // Only update pending transactions
      .select()
      .single()

    if (error) {
      console.error("Error updating transaction status:", error)
      return NextResponse.json({ success: false, message: "Failed to update transaction status" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Transaction not found or already processed" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
      transaction: data,
    })
  } catch (error) {
    console.error("Error in update transaction status API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
