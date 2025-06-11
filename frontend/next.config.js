/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// .env에서 NEXT_PUBLIC_APP_VERSION 읽기
let appVersion = 'unknown';
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^NEXT_PUBLIC_APP_VERSION=(.*)$/m);
    if (match) {
      appVersion = match[1].trim();
    }
  }
} catch (e) {}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: '/easy-memo',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  assetPrefix: '/easy-memo/',
  distDir: 'out',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/easy-memo',
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 