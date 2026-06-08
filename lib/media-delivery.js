/**
 * `sizes` tells the browser which `w=` to request from `/_next/image`.
 * Mobile/tablet caps stay tight; desktop/laptop request larger widths for sharp 2x displays.
 */
export const PROJECT_CARD_SIZES = {
  oneColumn:
    '(max-width: 1366px) 48vw, (max-width: 1919px) 42vw, 720px',
  twoColumns:
    '(max-width: 1366px) 94vw, (max-width: 1919px) 46vw, 960px',
}

/** Mobile / tablet accordion & layout-mobile cards */
export const MOBILE_CARD_SIZES = '(max-width: 1366px) 92vw, 640px'

/** Full-screen gallery */
export const GALLERY_IMAGE_SIZES =
  '(max-width: 1366px) 100vw, (max-width: 1919px) 92vw, 1400px'

export const IMAGE_QUALITY = {
  card: 90,
  mobile: 70,
  gallery: 90,
}

/** Layout aspect ratio for next/image (drives height from chosen width). */
export const IMAGE_DIMENSIONS = {
  card: { width: 640, height: 377 },
  cardSmall: { width: 360, height: 211 },
  gallery: { width: 1400, height: 823 },
}
