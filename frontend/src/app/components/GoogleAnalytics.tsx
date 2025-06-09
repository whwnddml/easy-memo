'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// GA 타입 선언
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  useEffect(() => {
    // 앱 타입 감지 (PWA로 실행되었는지 확인)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone || 
                 document.referrer.includes('android-app://');

    // GA 이벤트 전송
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'app_type_detection', {
        'app_type': isPWA ? 'mobile_app' : 'desktop_web',
        'platform': navigator.platform,
        'user_agent': navigator.userAgent
      });
    }
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            'custom_map': {
              'dimension1': 'app_type',
              'dimension2': 'platform'
            }
          });
        `}
      </Script>
    </>
  );
} 