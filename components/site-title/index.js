import cn from 'clsx'
import s from './site-title.module.scss'

const TITLE = 'Arteria Studios'

export function SiteTitle({ className }) {
  return (
    <h1 className={cn(s.root, 'h1', className)} aria-label={TITLE}>
      <span className={s.inner} aria-hidden="true">
        {[...TITLE].map((char, i) => (
          <span key={i} className={s.char}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </h1>
  )
}
