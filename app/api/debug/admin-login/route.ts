import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
    }

    // Cek apakah user ada di database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, role, password")
      .eq("username", username)
      .single()

    if (error) {
      // Jika error karena tidak ada data, berikan pesan khusus
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "User tidak ditemukan",
            error: error.message,
            errorCode: error.code,
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: "Database error",
          error: error.message,
          errorCode: error.code,
        },
        { status: 500 },
      )
    }

    // Jangan tampilkan password lengkap, hanya beberapa karakter pertama
    const passwordPreview = user.password ? user.password.substring(0, 10) + "..." : "Password tidak ada"

    return NextResponse.json({
      success: true,
      message: "User ditemukan",
      userInfo: {
        id: user.id,
        username: user.username,
        role: user.role,
        passwordPreview: passwordPreview,
        isAdmin: user.role === "admin",
        passwordFormat: {
          startsWithBcrypt: user.password?.startsWith("$2") || false,
          length: user.password?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("Debug admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
