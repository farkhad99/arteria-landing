#!/usr/bin/env node
/**
 * Ensures S3 hostnames are baked into the production image optimizer allowlist.
 * Run after `next build` (CI + Docker builder).
 */
const fs = require('fs')
const path = require('path')
const { getS3ImageHostsFromEnv } = require('../lib/s3-image-hosts.cjs')

const requiredFile = path.join(__dirname, '../.next/required-server-files.json')

if (!fs.existsSync(requiredFile)) {
  console.error('Missing .next/required-server-files.json — run `npm run build` first.')
  process.exit(1)
}

const { config } = JSON.parse(fs.readFileSync(requiredFile, 'utf8'))
const images = config?.images
if (!images) {
  console.error('No images config in required-server-files.json')
  process.exit(1)
}

const domains = new Set(images.domains || [])
const patternHosts = (images.remotePatterns || []).map((p) => p.hostname)
const hasWildcard = patternHosts.some((h) => h.includes('*'))

const requiredHosts = getS3ImageHostsFromEnv()
const missing = requiredHosts.filter(
  (host) => !domains.has(host) && !hasWildcard,
)

if (missing.length > 0) {
  console.error('S3 host(s) missing from next/image allowlist after build:', missing.join(', '))
  console.error('domains:', [...domains])
  console.error('remotePatterns hostnames:', patternHosts)
  process.exit(1)
}

console.log('OK: next/image allowlist includes S3 hosts:', requiredHosts.join(', '))
