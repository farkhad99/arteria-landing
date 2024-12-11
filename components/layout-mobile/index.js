import { Image } from '@studio-freight/compono'
import cn from 'clsx'
import { ProjectAccordion } from 'components/project-accordion'
import s from './layout-mobile.module.scss'

const LayoutMobile = ({ projects }) => {
  return (
    <div className={s.content}>
      <section className={s['hero-image']}>
        <Image
          src="/mobile-temp-images/tetsuo.jpg"
          alt="tetsuo placeholder face"
          fill
        />
      </section>
      <section className={cn(s.projects, 'layout-block')}>
        <ProjectAccordion data={projects.items} />
      </section>
      <section className={s.image}>
        <Image
          src={'/mobile-temp-images/sf-game-boy.png'}
          alt={'tetsuo placeholder face'}
          fill
        />
      </section>
      <section className={cn(s.about, 'layout-block')}>
        <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
          About
        </p>
        <div className={s.description}>
          ArteriaStudios is a subscription-based creative studio empowering
          brands and startups with design solutions that scale, adapt, and
          inspire. We’re more than just designers—we’re your partners in
          building brands, crafting websites, and launching ideas that leave a
          lasting impression. Our clients come from diverse industries but share
          a common drive: to stand out, connect authentically, and create
          meaningful impact. At Arteria, we to exceed them with every project,
          delivering creative solutions that elevate businesses to new heights.
          Whether you're a startup finding your footing or an established brand
          seeking a fresh perspective, ArteriaStudios is here to guide your
          journey with innovative design, strategic thinking, and a relentless
          commitment to your success. Let's create something extraordinary
          together.
        </div>
      </section>
    </div>
  )
}

export { LayoutMobile }
