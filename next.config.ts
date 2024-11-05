/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@microsoft/microsoft-graph-client",
    ],
  },
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   serverExternalPackages: [
//     "@prisma/client",
//     "@microsoft/microsoft-graph-client",
//   ],

//   webpack: (config, { isServer }) => {
//     if (isServer) {
//       // Convert externals to array if it's not already
//       const currentExternals = Array.isArray(config.externals)
//         ? config.externals
//         : [config.externals].filter(Boolean);

//       config.externals = [...currentExternals, "@prisma/client"];
//     }
//     return config;
//   },
// };

// export default nextConfig;
