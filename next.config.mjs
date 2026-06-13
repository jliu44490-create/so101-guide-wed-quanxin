/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build output for container deploys (the CN / Hong Kong node).
  // Vercel ignores this and uses its own pipeline, so the global deploy is
  // unaffected.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
