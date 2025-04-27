import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { supabase } from "./supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  username: string
  role: "admin" | "user"
  kelas?: string
  nis?: string
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password with hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Verify JWT token
export const verifyToken = (token: string): User | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch (error) {
    return null
  }
}

// Register a new student
export const registerUser = async (
  username: string,
  password: string,
  kelas: string,
  nis: string,
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

    if (existingUser) {
      return { success: false, message: "Username already exists" }
    }

    // Check if NIS already exists
    const { data: existingNIS } = await supabase.from("users").select("nis").eq("nis", nis).single()

    if (existingNIS) {
      return { success: false, message: "NIS already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        role: "user", // Students are always 'user'
        kelas,
        nis,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      message: "Registration successful",
      user: data as User,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed" }
  }
}

// Login user
export const loginUser = async (
  username: string,
  password: string,
): Promise<{ success: boolean; message: string; user?: User; token?: string }> => {
  try {
    // Get user by username
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error || !user) {
      return { success: false, message: "Invalid username or password" }
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid username or password" }
    }

    // Generate token
    const token = generateToken(user)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        kelas: user.kelas,
        nis: user.nis,
      },
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed" }
  }
}
