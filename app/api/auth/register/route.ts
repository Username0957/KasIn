import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const { username, password, fullName, kelas, nis, role = "user" } = body

    // Validate input
    if (!username || !password || !fullName || !kelas || !nis) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if username already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected
      console.error("Error checking existing user:", userCheckError)
      return NextResponse.json({ success: false, message: "Error checking username availability" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    // Check if NIS already exists
    const { data: existingNIS, error: nisCheckError } = await supabase
      .from("users")
      .select("nis")
      .eq("nis", nis)
      .single()

    if (nisCheckError && nisCheckError.code !== "PGRST116") {
      console.error("Error checking existing NIS:", nisCheckError)
      return NextResponse.json({ success: false, message: "Error checking NIS availability" }, { status: 500 })
    }

    if (existingNIS) {
      return NextResponse.json({ success: false, message: "NIS already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Validate role
    const validRole = role === "admin" || role === "user" ? role : "user"

    // Insert new user directly into the users table
    const { data, error: insertError } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        full_name: fullName, // Added full name
        role: validRole,
        kelas,
        nis,
      })
      .select("id, username, full_name, role, kelas, nis")
      .single()

    if (insertError) {
      console.error("Error inserting user:", insertError)
      return NextResponse.json({ success: false, message: "Failed to create user account" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Registration successful", user: data }, { status: 201 })
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json({ success: false, message: "Server error occurred during registration" }, { status: 500 })
  }
}
