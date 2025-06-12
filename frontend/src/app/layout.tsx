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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EasyMemo',
  },
  icons: {
    icon: [
      { url: '/easy-memo/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/easy-memo/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/easy-memo/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
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
      <head>
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        
        {/* iOS 전용 PWA 메타태그 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EasyMemo" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* 주소창/탭바 숨기기 */}
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* 확대/축소 방지 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
        
        {/* 상태바 색상 */}
        <meta name="theme-color" content="#4A90E2" />
        <meta name="msapplication-navbutton-color" content="#4A90E2" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 