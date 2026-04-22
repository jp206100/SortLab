import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  } as Record<string, unknown>,
};

export default nextConfig;
