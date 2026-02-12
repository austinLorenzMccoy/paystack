import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build/SSG when env vars are missing
    return null as unknown as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()
