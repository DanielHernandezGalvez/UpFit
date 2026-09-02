import { Analytics } from '@vercel/analytics/next'
import { Kumbh_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const kumbhSans = Kumbh_Sans({ subsets: ['latin'], variable: '--font-kumbh-sans' })

export const metadata: Metadata = {
  title: 'El Creador Web · Business OS',
  description: 'Administra clientes, finanzas, impuestos y tareas de El Creador Web.',
  generator: 'El Creador Web',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0E1620',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${kumbhSans.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
