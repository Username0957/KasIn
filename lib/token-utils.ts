import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface DecodedToken {
  id: string
  username: string
  role: string
  exp: number
  [key: string]: any
}

export const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export const generateToken = (payload: any, expiresIn: string | number = "24h"): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] })
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken
  } catch (error) {
    console.error("Token decode error:", error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now()
}

export const isAdmin = (token: string): boolean => {
  const decoded = decodeToken(token)
  return !!decoded && decoded.role === "admin" && !isTokenExpired(token)
}
