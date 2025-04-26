// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  /* ───────────────  IMAGES  ─────────────── */
  images: {
    remotePatterns: [
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Agregá otros orígenes externos acá ↓
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.tusitio.com',
      //   pathname: '/media/**',
      // },
    ],
  },

  /* ───────────────  WEBPACK  ─────────────── */
  webpack(config, { isServer }) {
    if (!isServer) {
      // Evitar bundling de módulos nativos en el lado cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
        util: false,
      };

      // Alias a módulos sólo-servidor para que no se incluyan en el bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        bcrypt: false,
        'node-pre-gyp': false,
        '@mapbox/node-pre-gyp': false,
        '@prisma/client': false,
        '@prisma/client/runtime/library.mjs': false,
        'node:module': false,
      };

      // Marcar Prisma como external para el bundle del browser
      config.externals = [
        ...(config.externals as any),
        /^@prisma\/client($|\/)/,
        /^@prisma\/client\/runtime($|\/)/,
      ];
    }
    return config;
  },
};

export default nextConfig;
