import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from './components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

// Google Analytics 측정 ID
const GA_MEASUREMENT_ID = 'G-MTWMMHJP0J'

export const viewport: Viewport = {
  themeColor: '#4A90E2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'EasyMemo - 간단한 메모장',
  description: '언제 어디서나 메모를 작성하고 관리하세요',
  manifest: '/easy-memo/manifest.json',
  icons: {
    icon: [
      { url: '/easy-memo/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/easy-memo/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        {children}
      </body>
    </html>
  )
} 