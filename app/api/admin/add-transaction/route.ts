import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyToken } from "@/lib/token-utils"

export async function POST(req: NextRequest) {
  try {
    // Verifikasi token admin
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Authorization header missing or invalid format")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      console.error("Invalid token or not admin role:", decoded)
      return NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { userId, amount, description, type, status } = body

    // Validasi input
    if (!userId || !amount || !description) {
      return NextResponse.json({ success: false, message: "Semua field harus diisi" }, { status: 400 })
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Jumlah harus berupa angka positif" }, { status: 400 })
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ success: false, message: "Tipe transaksi tidak valid" }, { status: 400 })
    }

    if (status !== "pending" && status !== "approved" && status !== "rejected") {
      return NextResponse.json({ success: false, message: "Status transaksi tidak valid" }, { status: 400 })
    }

    // Cek apakah user ada
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error checking user:", userError)
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan" }, { status: 400 })
    }

    // Insert transaction
    const { data, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        amount,
        description,
        type,
        status,
      })
      .select("id, amount, description, type, status, created_at")
      .single()

    if (insertError) {
      console.error("Error inserting transaction:", insertError)
      return NextResponse.json({ success: false, message: "Gagal menambahkan transaksi" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi berhasil ditambahkan",
        transaction: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Add transaction API error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
