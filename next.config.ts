import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    authInterception: false,
  },
};

export default nextConfig;
