import cn from 'clsx'
import s from './site-title.module.scss'

const LABEL = 'ARTERIA STUDIOS'

export function SiteTitle({ className }) {
  return (
    <h1 className={cn(s.root, 'h1', className)} aria-label="Arteria Studios">
      <div className={s.viewport} aria-hidden="true">
        <div className={s.track}>
          <span className={s.slide}>{LABEL}</span>
          <span className={s.slide}>{LABEL}</span>
        </div>
      </div>
    </h1>
  )
}
