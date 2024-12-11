import { Cursor, CustomHead, Scrollbar } from '@studio-freight/compono'
import { useDebug } from '@studio-freight/hamo'
import cn from 'clsx'
import { Footer } from 'components/footer'
import { Header } from 'components/header'
import dynamic from 'next/dynamic'
import s from './layout.module.scss'

const Orchestra = dynamic(
  () => import('lib/orchestra').then(({ Orchestra }) => Orchestra),
  { ssr: false },
)

export function Layout({
  seo = {
    title: 'Arteria Studios - Built on Principle',
    description:
      'ArteriaStudios is a subscription-based creative studio empowering brands and startups with design solutions that scale, adapt, and inspire.',
    image: { url: 'https://studiofreight.com/sf-og.jpg' },
    keywords: [
      'Branding',
      'Branding Guidelines',
      'Positioning',
      'Logo design',
      'Visual identity',
      'Tone of voice',

      'Web Development',

      'Landing Page',

      'Framer Development',

      'Webflow Development',

      'Email Newsellers',

      'Presentations',

      'Pitch Deck',

      'Project Release',

      'Promo materials',

      'Design system',

      'Basic UI kit',

      'Custom design systems',

      'Documentation',

      'Scalability',

      'Product Design',

      'Visual Expertise',

      'Research',

      'QA',

      'Release Management',

      'App Design',

      'IOS, Android, Web apps',

      'Cross platform projects',

      'Smart TV apps',

      'Automotive apps',

      'Marketing',

      'Brand Audition',

      'Research',

      'Content Analysis',

      'Retail Design',

      'CGI Advertisement',

      'Reels for brand',

      'Content for Retail',

      'arteria',
      'studio',
      'UX',
      'UI',
      'userexperience',
      'webdesign',
      'webdeveloper',
      'design',
      'codedesign',
      'code',
      'hashtag',
      'development',
      'website',
      'websitedevelopment',
      'webservices',
      'art direction',
      'strategy',
      'web',
      'murals',
      'illustration',
      'photography',
      'signage',
      'video',
    ],
  },
  children,
  theme = 'dark',
  className,
  principles,
  footerLinks,
  studioInfo,
  contactData,
}) {
  const debug = useDebug()

  return (
    <>
      <CustomHead {...seo} />

      <div className={cn(`theme-${theme}`, s.layout, className)}>
        <Cursor />
        <Scrollbar />
        <Header principles={principles} contact={contactData} />
        <main className={s.main}>{children}</main>
        <Footer links={footerLinks} studioInfo={studioInfo} />
      </div>

      {debug && (
        <>
          <Orchestra />
        </>
      )}
    </>
  )
}
