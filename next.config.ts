import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/f/**',
      },
    ],
  },
  transpilePackages: ['swagger-ui-react'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
};

export default nextConfig;
