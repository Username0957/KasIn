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
    const { username, password, fullName, kelas, nis, role } = body

    // Validasi input
    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "Username, password, dan nama lengkap harus diisi" },
        { status: 400 },
      )
    }

    // Jika role adalah user, kelas dan NIS harus diisi
    if (role === "user" && (!kelas || !nis)) {
      return NextResponse.json(
        { success: false, message: "Kelas dan NIS harus diisi untuk akun siswa" },
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

    // Jika role adalah user, cek apakah NIS sudah ada
    if (role === "user") {
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
        return NextResponse.json({ success: false, message: "NIS sudah digunakan" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert user
    const { data, error: insertError } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        full_name: fullName,
        role: role === "admin" ? "admin" : "user",
        kelas: role === "user" ? kelas : null,
        nis: role === "user" ? nis : null,
      })
      .select("id, username, full_name, role, kelas, nis")
      .single()

    if (insertError) {
      console.error("Error inserting user:", insertError)
      return NextResponse.json({ success: false, message: "Gagal menambahkan pengguna" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pengguna berhasil ditambahkan",
        user: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Add user API error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
