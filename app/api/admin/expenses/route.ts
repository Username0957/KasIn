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
    const { amount, description } = body

    // Validate input
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 })
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
      return NextResponse.json({ success: false, message: "Description is required" }, { status: 400 })
    }

    // Try to insert into expenses table first
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          amount: Number(amount),
          description: description.trim(),
          created_by: decoded.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: "Expense added successfully",
        expense: data,
      })
    } catch (expenseError) {
      console.log("Error adding to expenses table, trying transactions table:", expenseError)

      // If expenses table doesn't exist, insert as expense transaction
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: decoded.id,
          amount: Number(amount),
          description: description.trim(),
          type: "expense",
          status: "approved", // Auto-approve admin expenses
          approved_by: decoded.id,
          approved_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding expense transaction:", error)
        return NextResponse.json({ success: false, message: "Failed to add expense" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Expense added successfully as transaction",
        expense: data,
      })
    }
  } catch (error) {
    console.error("Error in add expense API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

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

    // Try to get expenses from expenses table
    try {
      const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        expenses: data,
      })
    } catch (expenseError) {
      console.log("Error getting from expenses table, trying transactions table:", expenseError)

      // If expenses table doesn't exist, get expense transactions
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting expense transactions:", error)
        return NextResponse.json({ success: false, message: "Failed to get expenses" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        expenses: data,
      })
    }
  } catch (error) {
    console.error("Error in get expenses API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
