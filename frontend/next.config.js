/** @type {import('next').NextConfig} */
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
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/easy-memo',
  },
  // PWA 설정은 배포 성공 후 추가
  // 현재는 정적 사이트 배포에 집중
}

module.exports = nextConfig 