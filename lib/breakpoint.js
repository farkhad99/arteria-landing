import { useSyncExternalStore } from 'react'

/** Must match `$tablet-layout-max` in `styles/_variables.scss`. */
export const PHONE_BREAKPOINT_PX = 800
export const TABLET_LAYOUT_MAX_PX = 1366
/** Layout: mobile through tablet; desktop grid above this width */
export const MOBILE_BREAKPOINT_PX = TABLET_LAYOUT_MAX_PX

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`
const DESKTOP_QUERY = `(min-width: ${TABLET_LAYOUT_MAX_PX + 1}px)`

function subscribeMobile(onStoreChange) {
  const mq = window.matchMedia(MOBILE_QUERY)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

/** Mobile-first SSR default (matches previous `!isDesktop` when query was still `undefined`). */
function getMobileServerSnapshot() {
  return true
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  )
}

export function useIsDesktop() {
  return !useIsMobile()
}

export { MOBILE_QUERY, DESKTOP_QUERY }
