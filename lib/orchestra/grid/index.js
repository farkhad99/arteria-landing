import { useIsMobile } from 'lib/breakpoint'
import cn from 'clsx'
import { useMemo } from 'react'
import s from './grid.module.scss'

export function GridDebugger() {
  const isMobile = useIsMobile()

  const columns = useMemo(() => {
    return parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--layout-columns-count'
      )
    )
  }, [isMobile])

  return (
    <div className={s.grid}>
      <div className={cn('layout-grid', s.debugger)}>
        {new Array(columns).fill(0).map((_, key) => (
          <span key={key} />
        ))}
      </div>
    </div>
  )
}
