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

    // Simplified query without joins
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching simple transactions:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("Error in admin simple-transactions API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
