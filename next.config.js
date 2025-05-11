/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
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