import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"

import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  applicationName: "Upfit",
  title: {
    default: "Upfit",
    template: "%s · Upfit",
  },
  description: "Registra tus entrenamientos y sigue tu progreso en el gimnasio.",
  appleWebApp: {
    capable: true,
    title: "Upfit",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
