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

const isDev = process.env.NODE_ENV !== 'production';
const basePath = isDev ? '' : '/easy-memo';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: basePath,
  images: {
    unoptimized: true,
  },
  assetPrefix: isDev ? '' : '/easy-memo/',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_API_URL: isDev ? 'http://localhost:3005/api' : 'https://junny.dyndns.org:3008/api'
  }
}

module.exports = nextConfig 