import cn from 'clsx'
import s from './site-title.module.scss'

const LABEL = 'ARTERIA STUDIOS'
/** Even count — animation moves -50% for a seamless loop */
const MARQUEE_COPIES = 14

export function SiteTitle({ className }) {
  return (
    <h1 className={cn(s.root, className)} aria-label="Arteria Studios">
      <div className={s.viewport} aria-hidden="true">
        <div className={s.track}>
          {Array.from({ length: MARQUEE_COPIES }, (_, index) => (
            <span className={s.slide} key={index}>
              {LABEL}
            </span>
          ))}
        </div>
      </div>
    </h1>
  )
}
