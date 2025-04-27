import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json()
    const { studentId, amount } = body

    // Validate input
    if (!studentId || !amount) {
      return NextResponse.json({ success: false, message: "Student ID and amount are required" }, { status: 400 })
    }

    // Check if amount is a multiple of 5000
    if (amount % 5000 !== 0) {
      return NextResponse.json({ success: false, message: "Amount must be a multiple of 5000" }, { status: 400 })
    }

    // Check if user is admin or the student themselves
    if (decoded.role !== "admin" && decoded.id !== studentId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Process payment - this will only update unpaid weeks
    const { data, error } = await supabase.rpc("process_weekly_payment", {
      student_id_param: studentId,
      amount_param: amount,
    })

    if (error) {
      console.error("Error processing weekly payment:", error)
      return NextResponse.json({ success: false, message: "Failed to process payment" }, { status: 500 })
    }

    // Only create a transaction record if weeks were actually paid
    if (data && data > 0) {
      // Create a transaction record for this payment
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: studentId,
        amount: amount,
        description: `Pembayaran kas mingguan untuk ${data} minggu`,
        type: "income",
        status: "approved",
        approved_by: decoded.role === "admin" ? decoded.id : null,
        approved_at: new Date().toISOString(),
      })

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError)
        // Continue despite transaction error, as the payment was processed
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully paid for ${data} weeks`,
      weeksPaid: data,
    })
  } catch (error) {
    console.error("Error in process weekly payment API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
