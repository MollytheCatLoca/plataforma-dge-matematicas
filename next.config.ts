// next.config.ts - Verificar y simplificar
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Evitar bundling de módulos nativos en cliente
    if (!isServer) {
      // Fallback de módulos Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
        util: false,
      };
      // Aliasing de módulos problemáticos
      config.resolve.alias = {
        ...config.resolve.alias,
        bcrypt: false,
        'node-pre-gyp': false,
        '@mapbox/node-pre-gyp': false,
        '@prisma/client': false,
        '@prisma/client/runtime/library.mjs': false,
        'node:module': false,
      };
      // Externals para librerías de servidor
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