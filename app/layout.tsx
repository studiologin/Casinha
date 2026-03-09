import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#E8763A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Casinha",
  description: "Gestão da nossa casinha 🏠",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Casinha",
  },
  icons: {
    icon: "https://lkdmvkbbpfwfrznaxxym.supabase.co/storage/v1/object/public/Imagens%20App/logo-casinha.png",
    shortcut: "https://lkdmvkbbpfwfrznaxxym.supabase.co/storage/v1/object/public/Imagens%20App/logo-casinha.png",
    apple: "https://lkdmvkbbpfwfrznaxxym.supabase.co/storage/v1/object/public/Imagens%20App/logo-casinha.png",
  },
  openGraph: {
    title: "Casinha",
    description: "Gestão da nossa casinha 🏠",
    images: ["https://lkdmvkbbpfwfrznaxxym.supabase.co/storage/v1/object/public/Imagens%20App/logo-casinha.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://lkdmvkbbpfwfrznaxxym.supabase.co/storage/v1/object/public/Imagens%20App/logo-casinha.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body
        className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] h-screen overflow-hidden flex flex-col"
        suppressHydrationWarning
      >
        <main className="flex-1 overflow-hidden flex flex-col items-center">
          <div className="w-full max-w-2xl flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
