import { clearSessionCookie, isAdminAuthenticated } from 'lib/admin-auth'
import { useMemo, useState } from 'react'
import s from './admin.module.scss'

const emptyForm = {
  name: '',
  industry: '',
  body: '',
  testimonial: '',
  services: '',
  stack: '',
  link: '',
  mediaLayout: 'two_columns',
}

export default function AdminPage({ authenticated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authenticated)
  const [password, setPassword] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const [status, setStatus] = useState('')
  const [contacts, setContacts] = useState([])

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])

  const login = async (event) => {
    event.preventDefault()
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!response.ok) {
      setStatus('Login failed. Check ADMIN_PASSWORD secret.')
      return
    }
    setStatus('')
    setIsAuthenticated(true)
    fetchContacts()
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setStatus('')
  }

  const fetchContacts = async () => {
    const response = await fetch('/api/contact/requests')
    const payload = await response.json()
    if (response.ok) {
      setContacts(payload.items)
    }
  }

  const uploadMedia = async () => {
    if (!mediaFile) {
      return null
    }

    const presignResponse = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: mediaFile.name,
        contentType: mediaFile.type,
      }),
    })

    const signedPayload = await presignResponse.json()
    if (!presignResponse.ok) {
      throw new Error(signedPayload.error || 'Failed to create upload URL')
    }

    const uploadResponse = await fetch(signedPayload.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mediaFile.type },
      body: mediaFile,
    })
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3')
    }

    return {
      kind: mediaFile.type.startsWith('video/') ? 'video' : 'image',
      title: mediaFile.name,
      url: signedPayload.fileUrl,
      s3Key: signedPayload.key,
      contentType: mediaFile.type,
    }
  }

  const submitProject = async (event) => {
    event.preventDefault()
    setStatus('Saving project...')

    try {
      let uploaded = null
      if (mediaFile) {
        uploaded = await uploadMedia()
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mediaItems: uploaded ? [uploaded, ...mediaItems] : mediaItems,
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save project')
      }

      setStatus('Project created successfully.')
      setForm(emptyForm)
      setMediaFile(null)
      setMediaItems([])
      fetchContacts()
    } catch (error) {
      setStatus(error.message)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className={s.page}>
        <div className={s.container}>
          <h1 className={s.title}>Admin Login</h1>
          <form className={s.card} onSubmit={login}>
            <div className={s.field}>
              <label htmlFor="password">Admin password</label>
              <input
                id="password"
                className={s.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className={s.actions}>
              <button className={s.button} type="submit">
                Login
              </button>
            </div>
            {status && <p className={s.status}>{status}</p>}
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className={s.page}>
      <div className={s.container}>
        <h1 className={s.title}>Arteria Admin</h1>
        <div className={s.actions}>
          <button className={s.button} onClick={fetchContacts} type="button">
            Refresh contact requests
          </button>
          <button className={s.button} onClick={logout} type="button">
            Logout
          </button>
        </div>

        <form className={s.card} onSubmit={submitProject}>
          <h2>Upload Project</h2>
          <div className={s.grid}>
            <div className={s.field}>
              <label>Name</label>
              <input
                className={s.input}
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className={s.field}>
              <label>Industry</label>
              <input
                className={s.input}
                value={form.industry}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, industry: event.target.value }))
                }
              />
            </div>
            <div className={`${s.field} ${s.full}`}>
              <label>Body / Description</label>
              <textarea
                className={s.textarea}
                value={form.body}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, body: event.target.value }))
                }
              />
            </div>
            <div className={s.field}>
              <label>Services (comma separated)</label>
              <input
                className={s.input}
                value={form.services}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, services: event.target.value }))
                }
              />
            </div>
            <div className={s.field}>
              <label>Stack (comma separated)</label>
              <input
                className={s.input}
                value={form.stack}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, stack: event.target.value }))
                }
              />
            </div>
            <div className={s.field}>
              <label>Project URL</label>
              <input
                className={s.input}
                value={form.link}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, link: event.target.value }))
                }
              />
            </div>
            <div className={s.field}>
              <label>Media layout</label>
              <select
                className={s.select}
                value={form.mediaLayout}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mediaLayout: event.target.value }))
                }
              >
                <option value="two_columns">Two columns in row</option>
                <option value="full_width">Full width</option>
              </select>
            </div>
            <div className={`${s.field} ${s.full}`}>
              <label>Testimonial</label>
              <textarea
                className={s.textarea}
                value={form.testimonial}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, testimonial: event.target.value }))
                }
              />
            </div>
            <div className={`${s.field} ${s.full}`}>
              <label>Upload media (image/video)</label>
              <input
                className={s.input}
                type="file"
                accept="image/png,image/jpeg,image/webp,video/mp4"
                onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className={s.actions}>
            <button className={s.button} type="submit" disabled={!canSubmit}>
              Create project
            </button>
          </div>
          {status && <p className={s.status}>{status}</p>}
        </form>

        <section className={s.card}>
          <h2>Contact Form Requests</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 && (
                  <tr>
                    <td className={s.muted} colSpan={6}>
                      No requests loaded yet. Use refresh.
                    </td>
                  </tr>
                )}
                {contacts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.company || '-'}</td>
                    <td>{item.phone || '-'}</td>
                    <td>{item.message}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export async function getServerSideProps({ req, res }) {
  const authenticated = isAdminAuthenticated(req)
  if (!authenticated && req.cookies?.arteria_admin_session) {
    res.setHeader('Set-Cookie', clearSessionCookie())
  }

  return {
    props: {
      authenticated,
    },
  }
}
