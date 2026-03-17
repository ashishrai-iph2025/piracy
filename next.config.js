/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
    serverComponentsExternalPackages: ['mysql2', 'xlsx'],
  },
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
