// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '../styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'PreTermAI — Early Preterm Birth Risk Detection',
  description: 'AI-powered clinical decision support for early preterm birth risk assessment',
  keywords: ['preterm birth', 'AI healthcare', 'maternal health', 'risk detection'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="text-slate-900 antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

