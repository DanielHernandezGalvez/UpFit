import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"

import { AppNav } from "@/components/app-nav"
import { PwaRegister } from "@/components/pwa-register"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <AppNav />
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
