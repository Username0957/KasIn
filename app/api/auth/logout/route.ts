import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session_id")?.value

    if (sessionId) {
      // Delete the session from the database
      await supabase.from("sessions").delete().eq("id", sessionId)
    }

    // Create a response
    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })

    // Clear the session cookie
    response.cookies.set({
      name: "session_id",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
