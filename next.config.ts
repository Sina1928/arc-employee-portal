import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@microsoft/microsoft-graph-client",
    ],
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Convert externals to array if it's not already
      const currentExternals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals].filter(Boolean);

      config.externals = [...currentExternals, "@prisma/client"];
    }
    return config;
  },
};

export default nextConfig;
