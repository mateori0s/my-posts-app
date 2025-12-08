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
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SupabaseProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
