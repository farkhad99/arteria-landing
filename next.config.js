const path = require('path')

const s3Bucket = process.env.AWS_S3_BUCKET || 'arteria-uploads'
const s3Region = process.env.AWS_REGION || 'eu-north-1'
const s3Hostname = `${s3Bucket}.s3.${s3Region}.amazonaws.com`

const s3ImageHosts = [
  s3Hostname,
  'arteria-uploads.s3.eu-north-1.amazonaws.com',
  'arteria-uploads.s3.eu-central-1.amazonaws.com',
].filter((host, index, list) => list.indexOf(host) === index)

const s3RemotePatterns = s3ImageHosts.map((hostname) => ({
  protocol: 'https',
  hostname,
  pathname: '/**',
}))
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
    // Legacy allowlist — still respected by next/image in Next 14
    domains: s3ImageHosts,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.studiofreight.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      ...s3RemotePatterns,
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [256, 384, 512, 640, 750, 828],
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
