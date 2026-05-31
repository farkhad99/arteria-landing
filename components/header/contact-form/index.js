import * as Accordion from '@radix-ui/react-accordion'
import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { Separator } from 'components/separator'
import { slugify } from 'lib/slugify'
import { useStore } from 'lib/store'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import s from './contact-form.module.scss'

export function ContactForm({ data }) {
  const menuRef = useRef(null)
  const router = useRouter()
  const { contact } = router.query
  const [contactIsOpen, setContactIsOpen, showThanks, setShowThanks] = useStore(
    (state) => [
      state.contactIsOpen,
      state.setContactIsOpen,
      state.showThanks,
      state.setShowThanks,
    ],
  )

  const closeContactTab = () => {
    setContactIsOpen(false)
    router.push({
      pathname: router.pathname, // not router.asPath
      query: { confirm: true },
      shallow: true,
    })
    if (showThanks) setShowThanks(false)
  }
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  })
  const [status, setStatus] = useState('')

  const submitContact = async (event) => {
    event.preventDefault()
    setStatus('Submitting...')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to submit form')
      }
      setStatus(
        payload.telegramSent
          ? 'Message sent successfully.'
          : 'Saved successfully. Telegram notification failed.',
      )
      setFormState({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
      })
    } catch (error) {
      setStatus(error.message)
    }
  }

  useEffect(() => {
    const escFunction = (event) => {
      if (event.keyCode === 27) {
        closeContactTab()
      }
    }

    document.addEventListener('keydown', escFunction, false)
    return () => document.removeEventListener('keydown', escFunction, false)
  }, [])

  useEffect(() => {
    setContactIsOpen(contact)
  }, [contact])

  return (
    <div className={cn(s.container, contactIsOpen && s.open)}>
      <div className={s.overlay} onClick={closeContactTab} />
      <div className={cn(s.wrapper, contactIsOpen && s.open)} ref={menuRef}>
        <div className={s.heading}>
          <button className={cn('button', s.cta)} onClick={closeContactTab}>
            close
          </button>
          <Separator className={s.separator} />
        </div>
        {showThanks ? (
          <ScrollableBox className={s.scrollable} shadow={false}>
            <div className={s.content}>
              {/* {globalRenderer(data?.thankYouMessage)} */}
            </div>
          </ScrollableBox>
        ) : (
          <ScrollableBox className={s.scrollable} shadow={false}>
            <form className={s.form} onSubmit={submitContact}>
              <label className={s.label}>
                Name
                <input
                  className={s.input}
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label className={s.label}>
                Email
                <input
                  className={s.input}
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </label>
              <label className={s.label}>
                Company
                <input
                  className={s.input}
                  value={formState.company}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, company: event.target.value }))
                  }
                />
              </label>
              <label className={s.label}>
                Phone
                <input
                  className={s.input}
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </label>
              <label className={cn(s.label, s.full)}>
                Message
                <textarea
                  className={s.textarea}
                  value={formState.message}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, message: event.target.value }))
                  }
                  required
                />
              </label>
              <div className={cn(s.full, s.actions)}>
                <button className="button" type="submit">
                  Send request
                </button>
                {status && <p className="p-s text-muted">{status}</p>}
              </div>
            </form>
            <div className={s.accordion}>
              <p className="p text-uppercase text-bold text-muted">FAQ</p>
              <Accordion.Root
                type="single"
                className={s['accordion-root']}
                collapsible
              >
                {(data?.faqsCollection?.items || []).map((faq, i) => (
                  <Accordion.Item
                    value={slugify(faq.title)}
                    key={i}
                    className={s.item}
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className={s.trigger}>
                        <p className="p text-bold text-uppercase">
                          {faq.title}
                        </p>
                        <svg
                          className={s.icon}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 1H1V11" stroke="#00FF6A" />
                          <path d="M15 1H25V11" stroke="#00FF6A" />
                          <path d="M15 25L25 25L25 15" stroke="#00FF6A" />
                          <path d="M11 25L1 25L1 15" stroke="#00FF6A" />
                          <g className={s.x}>
                            <path
                              d="M8.75684 8.75745L17.2421 17.2427"
                              stroke="#00FF6A"
                            />
                            <path
                              d="M17.2422 8.75745L8.75691 17.2427"
                              stroke="#00FF6A"
                            />
                          </g>
                        </svg>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className={s['accordion-content']}>
                      {/* {renderer(faq.content)} */}
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          </ScrollableBox>
        )}
      </div>
    </div>
  )
}
