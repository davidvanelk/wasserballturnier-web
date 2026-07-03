import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    MATOMO_URL: process.env.MATOMO_URL ?? '',
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID ?? '',
    MATOMO_TOKEN_AUTH: process.env.MATOMO_TOKEN_AUTH ?? '',
  },
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
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.wasserball.elk-software.de',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
