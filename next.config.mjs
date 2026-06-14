/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output ONLY for the CN container build (the Dockerfile sets
  // NEXT_PUBLIC_REGION=cn before building). The global Vercel build keeps its
  // default output untouched, so pushing this is a no-op for lvjin.online.
  output: process.env.NEXT_PUBLIC_REGION === 'cn' ? 'standalone' : undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
