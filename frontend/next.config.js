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