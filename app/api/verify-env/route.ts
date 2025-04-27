import { NextResponse } from "next/server"

export async function GET() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseAnonKey) {
    // The key exists, but we don't want to expose it
    return NextResponse.json({ status: "success", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is set" }, { status: 200 })
  } else {
    return NextResponse.json({ status: "error", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" }, { status: 400 })
  }
}
