/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pbs.twimg.com'],
  },
  distDir: '.next',
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig