import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

// Add support for both GET and POST methods
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handleReject(req, params)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleReject(req, params)
}

// Common handler function for both GET and POST
async function handleReject(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transactionId = params.id

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

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update({
        status: "rejected",
        rejected_by: decoded.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .eq("status", "pending") // Only update pending transactions
      .select()
      .single()

    if (error) {
      console.error("Error rejecting transaction:", error)
      return NextResponse.json({ success: false, message: "Failed to reject transaction" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Transaction not found or already processed" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Transaction rejected successfully",
      transaction: data,
    })
  } catch (error) {
    console.error("Error in reject transaction API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
