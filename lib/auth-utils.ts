import bcrypt from "bcryptjs"
import { supabase } from "./supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  username: string
  role: "admin" | "user"
  kelas?: string
  nis?: string
}

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword The plain text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns A promise that resolves to a boolean indicating if the passwords match
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // Log untuk debugging (hapus di production)
    console.log("Comparing password:", {
      plainPasswordLength: plainPassword.length,
      hashedPasswordPrefix: hashedPassword.substring(0, 7),
      hashedPasswordLength: hashedPassword.length,
    })

    // Periksa apakah hashedPassword adalah string valid
    if (!hashedPassword || typeof hashedPassword !== "string") {
      console.error("Invalid hashed password:", hashedPassword)
      return false
    }

    // Periksa apakah format hash adalah bcrypt
    if (!hashedPassword.startsWith("$2")) {
      console.error("Password hash is not in bcrypt format")
      return false
    }

    // Gunakan bcrypt.compare untuk membandingkan password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
    console.log("Password match result:", isMatch)
    return isMatch
  } catch (error) {
    console.error("Error comparing passwords:", error)
    return false
  }
}

/**
 * Hashes a password using bcrypt
 * @param password The password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const getUserFromSessionId = async (sessionId: string): Promise<User | null> => {
  try {
    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError) {
      console.error("getUserFromSessionId - Session not found in database", sessionError)
      return null
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      console.warn("getUserFromSessionId - Session expired")
      return null
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, role, kelas, nis")
      .eq("id", session.user_id)
      .single()

    if (userError) {
      console.error("getUserFromSessionId - User not found", userError)
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      kelas: user.kelas,
      nis: user.nis,
    }
  } catch (error) {
    console.error("getUserFromSessionId - Error:", error)
    return null
  }
}

/**
 * Verifies an admin token and returns the admin user if valid
 * @param token The JWT token to verify
 * @returns The admin user if the token is valid, null otherwise
 */
export const verifyAdminToken = async (token: string): Promise<User | null> => {
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if token has required fields
    if (!decoded || !decoded.id || !decoded.role) {
      console.error("verifyAdminToken - Invalid token payload")
      return null
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      console.error("verifyAdminToken - User is not an admin")
      return null
    }

    // Get user from database to verify it still exists and is an admin
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, role")
      .eq("id", decoded.id)
      .eq("role", "admin")
      .single()

    if (error || !user) {
      console.error("verifyAdminToken - Admin user not found in database", error)
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role as "admin" | "user",
    }
  } catch (error) {
    console.error("verifyAdminToken - Error:", error)
    return null
  }
}
