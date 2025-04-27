import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a function to get the Supabase client
export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are not set. Using mock client.")
    // Return a mock client for development without env vars
    return createClient("https://example.com", "mock-key", {
      auth: {
        persistSession: false,
      },
    })
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Create the Supabase client
export const supabase = getSupabaseClient()
