import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Cliente de Supabase para uso en el cliente (Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente de Supabase para uso en el servidor (Server Components, API Routes, etc.)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

