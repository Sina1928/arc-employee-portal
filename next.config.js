/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@prisma/client"],

  // Add image domains if needed
  images: {
    domains: ["your-domain.com"],
  },

  // Add rewrites if needed
  async rewrites() {
    return [];
  },

  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Modify webpack config
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "@prisma/client"];
    }
    return config;
  },
};

module.exports = nextConfig;
