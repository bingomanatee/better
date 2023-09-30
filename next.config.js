/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dexie', 'lodash-es', 'rxdb', 'axios', 'lodash.clonedeep', '@wonderlandlabs/walrus'],
  compiler: {
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '**'
      }
    ]
  }
}

module.exports = nextConfig
