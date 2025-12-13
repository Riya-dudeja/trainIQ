/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better MediaPipe compatibility
  experimental: {
    // Other experimental features can go here
  },

  turbopack: {
    rules: {
      '*.wasm': {
        loaders: ['file-loader'],
        as: '*.wasm',
      },
    },
  },
  
  // Configure headers for MediaPipe WASM files
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for MediaPipe compatibility
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle MediaPipe WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Resolve fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Add externals for server-side rendering
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    // MediaPipe specific optimizations
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
    };

    return config;
  },

  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
    unoptimized: true,
  },

  // Output configuration
  output: 'standalone',
  
  // Disable React strict mode if it causes issues with MediaPipe
  reactStrictMode: false,
  
  // Transpile MediaPipe packages
  transpilePackages: ['@mediapipe/pose', '@mediapipe/drawing_utils'],
};

export default nextConfig;