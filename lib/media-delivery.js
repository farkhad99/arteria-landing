/**
 * `sizes` tells the browser which `w=` to request from `/_next/image`.
 * Keep caps close to real display width so mobile never downloads desktop-sized files.
 */
export const PROJECT_CARD_SIZES = {
  oneColumn: '(max-width: 800px) 48vw, 300px',
  twoColumns: '(max-width: 800px) 94vw, 400px',
}

/** Mobile accordion slides (~375px viewport) */
export const MOBILE_CARD_SIZES = '(max-width: 800px) 92vw, 360px'

/** Full-screen gallery */
export const GALLERY_IMAGE_SIZES = '(max-width: 800px) 100vw, 828px'

export const IMAGE_QUALITY = {
  card: 68,
  mobile: 70,
  gallery: 82,
}

/** Layout aspect ratio for next/image (drives height from chosen width). */
export const IMAGE_DIMENSIONS = {
  card: { width: 400, height: 236 },
  cardSmall: { width: 360, height: 211 },
  gallery: { width: 828, height: 487 },
}
