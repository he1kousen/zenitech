import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// These should be set in .env file (see .env.example)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars. Restart `npm run dev` after editing .env.'
  )
}

// Create and export Supabase client instance
// This is the single entry point for all Supabase operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the current authenticated user
// Returns the user object if authenticated, null if not
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error.message)
    return null
  }

  return user
}

// ============================================================================
// Image URL helper
// ============================================================================
// Supabase Storage support image transformation lewat query string ?width=...&quality=...
// Helper ini menambahkan parameter sesuai size yang diminta. Untuk URL yang
// bukan dari Supabase Storage (misal SVG fallback di /images/), URL dikembalikan
// apa adanya.
//
// Sizes:
//   thumb  → 100px  / quality 60 (avatar / row thumbnail)
//   medium → 400px  / quality 70 (card di catalog, grid)
//   full   → 800px  / quality 80 (hero / product detail)

const SIZE_PRESETS = {
  thumb: { width: 100, quality: 60 },
  medium: { width: 400, quality: 70 },
  full: { width: 800, quality: 80 },
}

export const getImageUrl = (url, size = 'medium') => {
  if (!url) return null

  // Skip transformasi untuk asset lokal atau URL non-supabase
  const isSupabaseStorage =
    typeof url === 'string' && url.includes('/storage/v1/object/')
  if (!isSupabaseStorage) return url

  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.medium

  try {
    const u = new URL(url)
    u.searchParams.set('width', String(preset.width))
    u.searchParams.set('quality', String(preset.quality))
    return u.toString()
  } catch {
    // Fallback kalau URL parsing gagal
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}width=${preset.width}&quality=${preset.quality}`
  }
}
