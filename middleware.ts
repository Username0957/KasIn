import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// This function will verify the JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    console.error("Middleware - Token verification error:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  console.log("Middleware checking path:", request.nextUrl.pathname)

  // Check if the path requires authentication
  const isAuthPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/statistics") ||
    request.nextUrl.pathname.startsWith("/settings")

  // Check if the path is for admin only
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin")

  // Handle root path - redirect to login
  if (request.nextUrl.pathname === "/") {
    // We'll let the page component handle this
    return NextResponse.next()
  }

  // For login and register pages, just proceed
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
    return NextResponse.next()
  }

  // For auth paths, check authorization header
  if (isAuthPath) {
    // In middleware, we can't access localStorage
    // We'll let the page components handle auth checks
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/statistics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
}
