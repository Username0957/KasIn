import { type NextRequest, NextResponse } from "next/server"
import { comparePassword } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    console.log("Admin login attempt for:", username)

    // Get user by username from the users table
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    console.log("User query result:", {
      userFound: !!user,
      error: error ? { code: error.code, message: error.message } : null,
    })

    if (error) {
      console.error("Error fetching user:", error)

      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
      }

      return NextResponse.json({ success: false, message: "Error fetching user data" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    // Check if user is admin - STRICT CHECK
    if (user.role !== "admin") {
      console.log("User is not an admin:", { username: user.username, role: user.role })
      return NextResponse.json({ success: false, message: "Unauthorized: Not an admin user" }, { status: 403 })
    }

    // Verifikasi password langsung dengan bcrypt untuk menghindari masalah dengan fungsi comparePassword
    let isPasswordValid = false

    try {
      // Coba dengan comparePassword dari lib/auth-utils
      isPasswordValid = await comparePassword(password, user.password)
      console.log("Password validation with comparePassword:", isPasswordValid)

      // Jika gagal, coba langsung dengan bcrypt
      if (!isPasswordValid) {
        isPasswordValid = await bcrypt.compare(password, user.password)
        console.log("Password validation with direct bcrypt:", isPasswordValid)
      }
    } catch (pwError) {
      console.error("Password comparison error:", pwError)
      // Jangan return di sini, biarkan flow berlanjut dengan isPasswordValid = false
    }

    if (!isPasswordValid) {
      // Tambahkan informasi debug (hapus di production)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
          debug: {
            passwordLength: password.length,
            storedPasswordFormat: user.password.substring(0, 7) + "...",
            bcryptVersion: bcrypt.genSaltSync(10).substring(0, 4),
          },
        },
        { status: 401 },
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      },
      JWT_SECRET,
    )

    // Create a response
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
        token: token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Admin login API error:", error)
    return NextResponse.json(
      { success: false, message: "Server error occurred during login", error: String(error) },
      { status: 500 },
    )
  }
}
