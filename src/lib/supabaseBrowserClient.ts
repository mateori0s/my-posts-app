"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Este cliente se usa SOLO en componentes cliente (React)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
