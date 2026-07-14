import { Marquee } from '@studio-freight/compono'
import { useIsMobile } from 'lib/breakpoint'
import va from '@vercel/analytics'
import cn from 'clsx'
import { ContactForm } from 'components/header/contact-form'
import { Separator } from 'components/separator'
import { SiteTitle } from 'components/site-title'
import { pad } from 'lib/maths'
import { useStore } from 'lib/store'
import s from './header.module.scss'

export const Header = ({ principles = [], contact }) => {
  const isMobile = useIsMobile()

  // const visible = usePageAppear()
  const [contactIsOpen, setContactIsOpen] = useStore((state) => [
    state.contactIsOpen,
    state.setContactIsOpen,
  ])

  return (
    <header className={cn(s.container, 'layout-block')}>
      <div className={cn(s.top, 'layout-grid')}>
        <div className={s.eggs}>
          <span className={s.egg}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/android-chrome-512x512.png"
              alt="Arteria"
              className={s.logo}
              width={24}
              height={24}
            />
          </span>
        </div>
        {!isMobile && (
          <Marquee className={s.marquee} duration={20}>
            {principles.map((principle, i) => (
              <p key={i} className={cn('p', s.principle)}>
                <span>{pad(i + 1)}</span>
                &nbsp;{principle}
                <span className={s.separator}>{'//'}</span>
              </p>
            ))}
          </Marquee>
        )}
        <button
          className={cn('button', s.cta)}
          onClick={() => {
            va.track('Opened Contact Form')
            setContactIsOpen(!contactIsOpen)
          }}
        >
          Contact
        </button>
      </div>
      <Separator />
      <div className={cn(s.header, 'layout-grid')}>
        <SiteTitle className={s.title} />
      </div>
      <Separator />

      {isMobile && (
        <Marquee className={s.marquee} duration={20}>
          {principles.map((principle, i) => (
            <p key={i} className={cn('p', s.principle)}>
              <span>{pad(i + 1)}</span>
              &nbsp;{principle}
              <span className={s.separator}>{'//'}</span>
            </p>
          ))}
        </Marquee>
      )}
      <ContactForm data={contact} />
    </header>
  )
}
