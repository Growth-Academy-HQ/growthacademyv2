import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['hubspot-credentials-na1.s3.amazonaws.com']
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
};

export default nextConfig;
