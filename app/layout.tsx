import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"

import { AppNav } from "@/components/app-nav"
import { InstallPrompt } from "@/components/install-prompt"
import { PwaRegister } from "@/components/pwa-register"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  applicationName: "Upfit",
  title: {
    default: "Upfit",
    template: "%s · Upfit",
  },
  description: "Registra tus entrenamientos y sigue tu progreso en el gym.",
  appleWebApp: {
    capable: true,
    title: "Upfit",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="es" className={poppins.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {session ? <AppNav /> : null}
        {children}
        <InstallPrompt />
        <PwaRegister />
      </body>
    </html>
  )
}
