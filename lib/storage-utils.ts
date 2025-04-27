// Konstanta untuk key dan durasi
const TOKEN_KEY = "auth_token"
const EXPIRY_KEY = "auth_token_expiry"
const EXPIRY_DAYS = 3 // Token berlaku selama 3 hari

/**
 * Menyimpan token ke sessionStorage dengan expiry time
 */
export const saveToken = (token: string): boolean => {
  if (!token) {
    console.error("saveToken: Token tidak valid (kosong atau undefined)")
    return false
  }

  try {
    // Cek apakah sessionStorage tersedia
    if (typeof sessionStorage === "undefined") {
      console.error("saveToken: sessionStorage tidak tersedia")
      return false
    }

    // Simpan token
    sessionStorage.setItem(TOKEN_KEY, token)
    console.log("saveToken: Token disimpan ke sessionStorage")

    // Verifikasi token tersimpan
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      console.error("saveToken: Verifikasi gagal - token tidak tersimpan")
      return false
    }

    // Hitung dan simpan waktu kedaluwarsa (3 hari dari sekarang)
    const expiryTime = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000
    sessionStorage.setItem(EXPIRY_KEY, expiryTime.toString())

    console.log("saveToken: Token berhasil disimpan dengan expiry:", new Date(expiryTime).toLocaleString())

    // Coba juga simpan ke localStorage sebagai backup
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString())
      console.log("saveToken: Token juga disimpan ke localStorage sebagai backup")
    } catch (localStorageError) {
      console.warn("saveToken: Tidak dapat menyimpan ke localStorage:", localStorageError)
      // Ini bukan error fatal, jadi kita lanjutkan
    }

    return true
  } catch (error) {
    console.error("saveToken: Error menyimpan token:", error)
    return false
  }
}

/**
 * Mendapatkan token dari sessionStorage jika masih valid
 */
export const getToken = (): string | null => {
  try {
    // Periksa apakah token ada
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) {
      return null
    }

    // Periksa apakah token sudah kedaluwarsa
    const expiryTimeStr = sessionStorage.getItem(EXPIRY_KEY)
    if (!expiryTimeStr) {
      // Jika tidak ada expiry time, hapus token dan return null
      sessionStorage.removeItem(TOKEN_KEY)
      return null
    }

    const expiryTime = Number.parseInt(expiryTimeStr, 10)
    const now = Date.now()

    if (now > expiryTime) {
      // Token sudah kedaluwarsa, hapus dan return null
      console.log("Token kedaluwarsa, menghapus dari sessionStorage")
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(EXPIRY_KEY)
      return null
    }

    // Token masih valid
    return token
  } catch (error) {
    console.error("Error mengakses token dari sessionStorage:", error)
    return null
  }
}

// Perbarui fungsi removeToken untuk menghapus token dari semua penyimpanan
/**
 * Menghapus token dari semua penyimpanan (sessionStorage, localStorage, dan cookie)
 */
export const removeToken = (): void => {
  try {
    // Hapus dari sessionStorage
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(EXPIRY_KEY)

    // Hapus dari localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)

    // Hapus dari cookie
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

    console.log("removeToken: Token berhasil dihapus dari semua penyimpanan")
  } catch (error) {
    console.error("Error menghapus token:", error)
  }
}

/**
 * Mendapatkan token dari cookie sebagai fallback
 */
export const getTokenFromCookie = (): string | null => {
  try {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(`${TOKEN_KEY}=`)) {
        return cookie.substring(`${TOKEN_KEY}=`.length, cookie.length)
      }
    }
    return null
  } catch (error) {
    console.error("Error mengakses token dari cookie:", error)
    return null
  }
}

/**
 * Mendapatkan token dari sessionStorage, localStorage, atau cookie
 */
export const getTokenFromAnySource = (): string | null => {
  console.log("getTokenFromAnySource: Mencoba mendapatkan token dari semua sumber")

  // Coba dapatkan dari sessionStorage
  try {
    const sessionToken = getToken()
    if (sessionToken) {
      console.log("getTokenFromAnySource: Token ditemukan di sessionStorage")
      return sessionToken
    }
  } catch (e) {
    console.warn("getTokenFromAnySource: Error mengakses sessionStorage:", e)
  }

  // Coba dapatkan dari localStorage
  try {
    const localToken = localStorage.getItem(TOKEN_KEY)
    if (localToken) {
      console.log("getTokenFromAnySource: Token ditemukan di localStorage")

      // Periksa expiry di localStorage
      const expiryTimeStr = localStorage.getItem(EXPIRY_KEY)
      if (expiryTimeStr) {
        const expiryTime = Number.parseInt(expiryTimeStr, 10)
        if (Date.now() <= expiryTime) {
          // Token masih valid, simpan ke sessionStorage juga
          try {
            sessionStorage.setItem(TOKEN_KEY, localToken)
            sessionStorage.setItem(EXPIRY_KEY, expiryTimeStr)
            console.log("getTokenFromAnySource: Token dari localStorage disimpan ke sessionStorage")
          } catch (e) {
            console.warn("getTokenFromAnySource: Gagal menyimpan token dari localStorage ke sessionStorage:", e)
          }
          return localToken
        } else {
          console.log("getTokenFromAnySource: Token di localStorage sudah kedaluwarsa")
        }
      } else {
        // Tidak ada expiry, anggap masih valid
        return localToken
      }
    }
  } catch (e) {
    console.warn("getTokenFromAnySource: Error mengakses localStorage:", e)
  }

  // Fallback ke cookie
  const cookieToken = getTokenFromCookie()
  if (cookieToken) {
    console.log("getTokenFromAnySource: Token ditemukan di cookie")
    // Jika token ditemukan di cookie, simpan ke sessionStorage untuk penggunaan berikutnya
    try {
      saveToken(cookieToken)
    } catch (e) {
      console.warn("getTokenFromAnySource: Gagal menyimpan token dari cookie ke sessionStorage:", e)
    }
    return cookieToken
  }

  console.log("getTokenFromAnySource: Tidak ada token yang ditemukan di semua sumber")
  return null
}
