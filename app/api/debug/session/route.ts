import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = req.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({
        status: "error",
        message: "No session cookie found",
        hasCookie: false,
      })
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError) {
      return NextResponse.json({
        status: "error",
        message: "Session not found in database",
        error: sessionError,
        hasCookie: true,
        sessionId: sessionId,
      })
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({
        status: "error",
        message: "Session expired",
        hasCookie: true,
        sessionId: sessionId,
        session: session,
      })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, role, kelas, nis")
      .eq("id", session.user_id)
      .single()

    if (userError) {
      return NextResponse.json({
        status: "error",
        message: "User not found",
        error: userError,
        hasCookie: true,
        sessionId: sessionId,
        session: session,
      })
    }

    return NextResponse.json({
      status: "success",
      hasCookie: true,
      sessionId: sessionId,
      session: session,
      user: user,
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({
      status: "error",
      message: "Server error",
      error: String(error),
    })
  }
}
