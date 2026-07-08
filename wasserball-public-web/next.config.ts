import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const strapiTarget = (
      process.env.STRAPI_URL ?? 'http://strapi:1337'
    ).replace(/\/$/, '');

    return [
      {
        source: '/cms/:path*',
        destination: `${strapiTarget}/:path*`,
      },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'wasserball.elk-software.de',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wasserball.feuerwehremmerich.de',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wasserball.feuerwehr-elten.de',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.wasserball.elk-software.de',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
