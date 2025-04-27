import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

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

    // Get total approved income transactions
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "income")
      .eq("status", "approved")

    if (incomeError) {
      console.error("Error fetching income data:", incomeError)
      return NextResponse.json({ success: false, message: "Failed to fetch income data" }, { status: 500 })
    }

    // Get total approved expense transactions
    const { data: expenseTransactions, error: expenseTransError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "expense")
      .eq("status", "approved")

    if (expenseTransError) {
      console.error("Error fetching expense transactions:", expenseTransError)
      return NextResponse.json({ success: false, message: "Failed to fetch expense transactions" }, { status: 500 })
    }

    // Calculate totals
    const totalKas = incomeData.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpenseFromTransactions = expenseTransactions.reduce((sum, item) => sum + Number(item.amount), 0)

    // Check if expenses table exists and get data from it
    let totalExpenseFromExpensesTable = 0
    try {
      const { data: expenseData, error: expenseError } = await supabase.from("expenses").select("amount")

      if (!expenseError && expenseData) {
        totalExpenseFromExpensesTable = expenseData.reduce((sum, item) => sum + Number(item.amount), 0)
      }
    } catch (error) {
      console.log("Expenses table might not exist or other error:", error)
      // Continue without expenses table data
    }

    const totalExpense = totalExpenseFromTransactions + totalExpenseFromExpensesTable

    return NextResponse.json({
      success: true,
      totalKas,
      totalExpense,
      balance: totalKas - totalExpense,
    })
  } catch (error) {
    console.error("Error in summary API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
