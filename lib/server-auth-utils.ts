import { cookies } from "next/headers"
import { getUserFromSessionId } from "./auth-utils"
import type { User } from "./auth-utils"

// Get user from cookies (server-side only)
export const getUserFromCookies = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return null
    }

    return await getUserFromSessionId(sessionId)
  } catch (error) {
    console.error("Error getting user from cookies:", error)
    return null
  }
}
