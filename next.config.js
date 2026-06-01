const path = require('path')
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@studio-freight/compono'],
  experimental: {
    urlImports: ['https://cdn.skypack.dev', 'https://unpkg.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.studiofreight.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arteria-uploads.s3.eu-north-1.amazonaws.com',
        pathname: '/projects/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@import 'styles/_functions';`,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            memo: true,
            dimensions: false,
            svgoConfig: {
              multipass: true,
              plugins: [
                'removeDimensions',
                'removeOffCanvasPaths',
                'reusePaths',
                'removeElementsByAttr',
                'removeStyleElement',
                'removeScriptElement',
                'prefixIds',
                'cleanupIds',
                {
                  name: 'cleanupNumericValues',
                  params: { floatPrecision: 1 },
                },
                {
                  name: 'convertPathData',
                  params: { floatPrecision: 1 },
                },
                {
                  name: 'convertTransform',
                  params: { floatPrecision: 1 },
                },
                {
                  name: 'cleanupListOfValues',
                  params: { floatPrecision: 1 },
                },
              ],
            },
          },
        },
      ],
    })

    return config
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
  redirects: async () => {
    return [
      { source: '/home', destination: '/', permanent: true },
      {
        source: '/capabilities',
        destination: '/Arteria-Capabilities.pdf',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
