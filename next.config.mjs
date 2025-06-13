/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false // 👈 esto evita que face-api.js intente usar 'fs' en el navegador
      }
    }
    return config
  }
}

export default nextConfig
