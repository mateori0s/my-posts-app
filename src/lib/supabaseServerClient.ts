// src/lib/supabaseServerClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente SOLO para el servidor (API routes, etc.)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // no intenta leer/escribir sesión en server
  },
});
