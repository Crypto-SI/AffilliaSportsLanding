/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // 'standalone' is for Docker self-hosting (see Dockerfile). On Vercel it breaks
  // build tracing (ENOENT .next/next-server.js.nft.json on Next 16), so only
  // enable it for non-Vercel builds.
  ...(process.env.VERCEL === '1' ? {} : { output: 'standalone' }),
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  // The src/app directory is the default in Next.js 15+
  // No need to set appDir: true, as that was for older versions
};

module.exports = nextConfig; 