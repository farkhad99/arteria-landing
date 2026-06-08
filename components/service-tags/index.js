import cn from 'clsx'
import s from './service-tags.module.scss'

export function ServiceTags({ items = [], className }) {
  if (!items?.length) return null

  return (
    <ul className={cn(s.tags, className)} aria-label="Services">
      {items.map((item) => (
        <li key={item.id} className={cn(s.tag, 'p-s')}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
