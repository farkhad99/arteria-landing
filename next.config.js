const path = require('path')
const {
  getS3ImageHostsFromEnv,
  getS3RemotePatterns,
} = require('./lib/s3-image-hosts.cjs')

const s3ImageHosts = getS3ImageHostsFromEnv()
const s3RemotePatterns = getS3RemotePatterns()
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const nextConfig = {
  output: 'standalone',
  // Standalone trace often omits sharp/@img — without them /_next/image returns originals at 200
  outputFileTracingIncludes: {
    '/*': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
  },
  reactStrictMode: true,
  transpilePackages: ['@studio-freight/compono'],
  experimental: {
    urlImports: ['https://cdn.skypack.dev', 'https://unpkg.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  images: {
    // Legacy allowlist — still respected by next/image in Next 14
    domains: s3ImageHosts,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.studiofreight.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      ...s3RemotePatterns,
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Mobile-first widths — srcset picks nearest `w` to `sizes` hint
    deviceSizes: [375, 390, 430, 640, 750, 828, 1080, 1200],
    imageSizes: [256, 320, 360, 384, 400, 480, 512, 640],
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
