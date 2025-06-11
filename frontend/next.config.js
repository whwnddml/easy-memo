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
  basePath: process.env.NODE_ENV === 'production' ? '/easy-memo' : '',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/easy-memo/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/easy-memo',
    NEXT_PUBLIC_APP_VERSION: appVersion,
  }
}

module.exports = nextConfig 