// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/src/components/SupabaseProvider";
import Navbar from "@/src/components/Navbar";

export const metadata: Metadata = {
  title: "My Posts App",
  description: "Simple post and comments app with Supabase + GitHub OAuth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body className="min-h-screen bg-gray-100 text-gray-900">
        <SupabaseProvider>
          <Navbar />
          <main className="max-w-2xl mx-auto p-4">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
