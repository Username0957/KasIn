import { type NextRequest, NextResponse } from "next/server"
import { comparePassword } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { addDays } from "date-fns"
import crypto from "crypto"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const { username, password, rememberMe } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    console.log("Login API - Login attempt for:", username)

    // Get user by username from the users table
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      console.error("Login API - Error fetching user:", error)

      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
      }

      return NextResponse.json({ success: false, message: "Error fetching user data" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      console.log("Login API - Invalid password for user:", username)
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    // Create a session ID for database tracking
    const sessionId = crypto.randomUUID()
    const expiresAt = addDays(new Date(), rememberMe ? 30 : 3) // 30 days if remember me, 3 days otherwise

    // Store session in database
    const { error: sessionError } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Login API - Error creating session:", sessionError)
      return NextResponse.json({ success: false, message: "Error creating session" }, { status: 500 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        sessionId: sessionId,
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      JWT_SECRET,
    )

    console.log("Login API - Login successful for:", username)
    console.log("Login API - Generated token successfully:", token ? "Yes" : "No")
    console.log("Login API - Token length:", token.length)
    console.log("Login API - Token preview:", token.substring(0, 20) + "...")

    // Create a response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role, // Ensure role is included
          kelas: user.kelas,
          nis: user.nis,
        },
        token: token,
      },
      { status: 200 },
    )

    // Set token as a cookie juga sebagai fallback
    response.cookies.set({
      name: "auth_token",
      value: token,
      expires: expiresAt,
      path: "/",
      httpOnly: false, // Bisa diakses oleh JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    console.log(
      "Login API - Response body preview:",
      JSON.stringify({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token: token.substring(0, 20) + "...",
      }),
    )

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { success: false, message: "Server error occurred during login", error: String(error) },
      { status: 500 },
    )
  }
}
