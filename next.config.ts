import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    'localhost',
    'localhost:3001',
    '127.0.0.1',
    '127.0.0.1:3001',
    '192.168.1.2',
    '192.168.1.2:3001',
    '*.local',
  ],
};

export default nextConfig;
