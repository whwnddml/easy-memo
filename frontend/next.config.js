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
  env: {
    NEXT_PUBLIC_BASE_PATH: '/easy-memo',
  }
}

module.exports = nextConfig 