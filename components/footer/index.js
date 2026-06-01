import { Image, Link } from '@studio-freight/compono'
import { useIsMobile } from 'lib/breakpoint'
import va from '@vercel/analytics'
import cn from 'clsx'
import { Separator } from 'components/separator'
import s from './footer.module.scss'

export function Footer({ className, style }) {
  const isMobile = useIsMobile()
  const footerPhone = '+998996924479'
  const footerEmail = 'segeayupov@gmail.com'

  return (
    <footer className={s.container}>
      <Separator className="layout-block" />
      <div className={cn(s.footer, 'layout-grid', className)} style={style}>
        <a
          href="/Arteria-Capabilities.pdf"
          download
          className={cn(s.column, 'p-s text-accent')}
          onClick={() => va.track('Downloaded Capabilities deck')}
        >
          Capabilities Deck ↓
        </a>

        <ul className={cn(s.column, s.contact)}>
          <li>
            <Link className="p-s decorate" href={`tel:${footerPhone}`}>
              P: {footerPhone}
            </Link>
          </li>
          <li>
            <Link className="p-s decorate" href={`mailto:${footerEmail}`}>
              E: {footerEmail}
            </Link>
          </li>
        </ul>

        <ul className={s.column}>
          <li className="p-s text-muted">
            &copy; {new Date().getFullYear()}
          </li>
        </ul>
      </div>

      {isMobile && (
        <section className={s['footer-image']}>
          <Image
            src="/mobile-temp-images/footer.png"
            alt="Arteria Studios"
            fill
            className={s.image}
          />
        </section>
      )}
    </footer>
  )
}
