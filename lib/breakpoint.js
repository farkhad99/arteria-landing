import { useSyncExternalStore } from 'react'

/** Must match `$mobile-breakpoint` in `styles/_variables.scss`. */
export const MOBILE_BREAKPOINT_PX = 800

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`
const DESKTOP_QUERY = `(min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`

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
