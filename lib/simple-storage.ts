/**
 * Simple utility functions for token storage and retrieval
 */

// Store token in both localStorage and sessionStorage for redundancy
export const storeToken = (token: string): void => {
  try {
    localStorage.setItem("auth_token", token)
  } catch (e) {
    console.warn("Failed to store token in localStorage:", e)
  }

  try {
    sessionStorage.setItem("auth_token", token)
  } catch (e) {
    console.warn("Failed to store token in sessionStorage:", e)
  }
}

// Get token from any available storage
export const getToken = (): string | null => {
  try {
    // Try localStorage first
    const localToken = localStorage.getItem("auth_token")
    if (localToken) return localToken

    // Fall back to sessionStorage
    const sessionToken = sessionStorage.getItem("auth_token")
    if (sessionToken) return sessionToken

    return null
  } catch (e) {
    console.error("Error accessing storage:", e)
    return null
  }
}

// Clear token from all storages
export const clearToken = (): void => {
  try {
    localStorage.removeItem("auth_token")
  } catch (e) {
    console.warn("Failed to clear token from localStorage:", e)
  }

  try {
    sessionStorage.removeItem("auth_token")
  } catch (e) {
    console.warn("Failed to clear token from sessionStorage:", e)
  }
}
