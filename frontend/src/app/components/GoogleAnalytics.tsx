'use client';

import Script from 'next/script';
let APP_VERSION = 'unknown';
try {
  APP_VERSION = require('../version').APP_VERSION || 'unknown';
} catch (e) {
  // ignore
}

// GA 타입 선언
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
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

          // 운영체제 감지
          let os = 'unknown';
          const userAgent = navigator.userAgent.toLowerCase();
          
          if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
            os = 'iOS';
          } else if (userAgent.includes('android')) {
            os = 'Android';
          } else if (userAgent.includes('windows')) {
            os = 'Windows';
          } else if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
            os = 'MacOS';
          } else if (userAgent.includes('linux')) {
            os = 'Linux';
          }

          // PWA 감지
          const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                       navigator.standalone || 
                       document.referrer.includes('android-app://');

          gtag('config', '${GA_MEASUREMENT_ID}', {
            custom_map: {
              dimension1: 'operating_system',
              dimension2: 'app_type'
            },
            operating_system: os,
            app_type: isPWA ? 'PWA' : 'Web'
          });

          // 사용자 정보 이벤트 전송
          gtag('event', 'user_info', {
            operating_system: os,
            app_type: isPWA ? 'PWA' : 'Web',
            user_agent: navigator.userAgent
          });

          // GA 이벤트 전송
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'app_type_detection', {
              'app_type': isPWA ? 'mobile_app' : 'desktop_web',
              'operating_system': os,
              'user_agent': navigator.userAgent,
              'app_version': APP_VERSION
            });
          }
        `}
      </Script>
    </>
  );
} 