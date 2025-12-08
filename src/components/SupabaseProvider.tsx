"use client";

import type { ReactNode } from "react";

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  // Acá podrías, en el futuro, agregar Context, listeners globales, etc.
  return <>{children}</>;
}
