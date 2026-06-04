/** Tuned for project panel cards (desktop ~403px tall, ~50% grid width). */
export const PROJECT_CARD_SIZES = {
  oneColumn: '(max-width: 800px) 46vw, 280px',
  twoColumns: '(max-width: 800px) 94vw, 520px',
}

/** Mobile accordion slides */
export const MOBILE_CARD_SIZES = '(max-width: 800px) 88vw, 343px'

/** Full-screen gallery */
export const GALLERY_IMAGE_SIZES = '(max-width: 800px) 100vw, 1200px'

export const IMAGE_QUALITY = {
  card: 68,
  mobile: 72,
  gallery: 85,
}

/** Intrinsic dimensions for next/image srcset (display size, not upload size). */
export const IMAGE_DIMENSIONS = {
  card: { width: 520, height: 306 },
  cardSmall: { width: 343, height: 211 },
  gallery: { width: 1200, height: 706 },
}
