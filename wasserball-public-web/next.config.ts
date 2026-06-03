import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    MATOMO_URL: process.env.MATOMO_URL ?? '',
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID ?? '',
    MATOMO_TOKEN_AUTH: process.env.MATOMO_TOKEN_AUTH ?? '',
  },
};

export default nextConfig;
