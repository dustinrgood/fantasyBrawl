/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // appDir is enabled by default in Next.js 13.5.6
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    serverActions: true,
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Fix for the react-server-dom-webpack/server.edge module not found error
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-server-dom-webpack/server.edge': 'next/dist/compiled/react-server-dom-webpack/server.edge.js',
      }
    }
    return config
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: "/api/openai/:path*",
        destination: "https://api.openai.com/:path*",
      },
    ];
  },
};

export default nextConfig;
