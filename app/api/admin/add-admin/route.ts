import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

export async function POST(req: NextRequest) {
  try {
    // Verifikasi token admin
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { username, password, fullName } = body

    // Validasi input
    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "Username, password, dan nama lengkap harus diisi" },
        { status: 400 },
      )
    }

    // Cek apakah username sudah ada
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking existing user:", userCheckError)
      return NextResponse.json({ success: false, message: "Error checking username availability" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Username sudah digunakan" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert admin user
    const { data, error: insertError } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        full_name: fullName,
        role: "admin",
        kelas: null,
        nis: null,
      })
      .select("id, username, full_name, role")
      .single()

    if (insertError) {
      console.error("Error inserting admin:", insertError)
      return NextResponse.json({ success: false, message: "Gagal menambahkan admin" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin berhasil ditambahkan",
        user: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Add admin API error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
