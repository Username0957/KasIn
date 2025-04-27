import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("delete_old_transactions")

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Old transactions deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting old transactions:", error)
    return NextResponse.json({ error: "Failed to delete old transactions" }, { status: 500 })
  }
}
