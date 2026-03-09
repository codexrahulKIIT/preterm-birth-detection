/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config, { dev }) => {
    // Stabilize Windows local dev where webpack filesystem cache
    // intermittently throws ENOENT rename/source-read issues.
    if (dev) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig

