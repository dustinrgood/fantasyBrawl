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
      };
    }
    
    // Fix for tr46.js and other vendor chunks
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    
    try {
      // Use path.resolve instead of require.resolve
      const path = require('path');
      const nodeModulesDir = path.resolve('./node_modules');
      
      config.resolve.fallback.tr46 = path.resolve(nodeModulesDir, 'tr46');
      config.resolve.fallback['whatwg-url'] = path.resolve(nodeModulesDir, 'whatwg-url');
      config.resolve.fallback['webidl-conversions'] = path.resolve(nodeModulesDir, 'webidl-conversions');
    } catch (error) {
      console.warn('Warning: Could not resolve module fallbacks', error);
    }
    
    return config;
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

module.exports = nextConfig; 