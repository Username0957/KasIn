import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/token-utils"

export async function POST(req: NextRequest) {
  try {
    // Verify admin token
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { transactionId, action } = body

    // Return debug info
    return NextResponse.json({
      success: true,
      debug: {
        transactionId,
        action,
        decodedToken: {
          id: decoded.id,
          role: decoded.role,
          username: decoded.username,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error in debug transaction status API:", error)
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
