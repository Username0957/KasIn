import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export const dynamic = "force-dynamic" // Disable caching for this route
export const revalidate = 0 // Disable revalidation

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("API /me - No Authorization header or invalid format")
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("API /me - Token from header:", token ? "Present" : "Missing")
    if (token) {
      console.log("API /me - Token length:", token.length)
      console.log("API /me - Token preview:", token.substring(0, 10) + "...")
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log("API /me - JWT verification successful, decoded user ID:", decoded.id)
    } catch (error) {
      console.error("API /me - JWT verification error:", error)
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Get user data from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, full_name, role, kelas, nis")
      .eq("id", decoded.id)
      .single()

    if (userError) {
      console.error("API /me - User error:", userError)
      return NextResponse.json({ success: false, message: "User not found", error: userError }, { status: 404 })
    }

    if (!user) {
      console.error("API /me - User not found for ID:", decoded.id)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("API /me - Successfully found user:", user.username)

    // Set cache control headers to prevent caching
    const response = NextResponse.json({ success: true, user }, { status: 200 })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Me API error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: String(error) }, { status: 500 })
  }
}
