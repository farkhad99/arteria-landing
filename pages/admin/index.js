import { clearSessionCookie, isAdminAuthenticated } from 'lib/admin-auth'
import cn from 'clsx'
import { useEffect, useMemo, useState } from 'react'
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

const projectToForm = (project) => ({
  name: project.name || '',
  industry: project.industry || '',
  body: project.body || '',
  testimonial: project.testimonial || '',
  services: (project.services || []).join(', '),
  stack: (project.stack || []).join(', '),
  link: project.link || '',
  mediaLayout:
    project.mediaLayout === 'FULL_WIDTH' ? 'full_width' : 'two_columns',
})

const projectToMediaItems = (project) =>
  (project.media || []).map((item, index) => ({
    id: item.id,
    kind: item.kind === 'VIDEO' ? 'video' : 'image',
    title: item.title || '',
    url: item.url,
    s3Key: item.s3Key,
    contentType: item.contentType || '',
    sortOrder: item.sortOrder ?? index,
    columnSpan: item.columnSpan === 'ONE_COLUMN' ? 'one_column' : 'two_columns',
  }))

const normalizeMediaItems = (items) =>
  items.map((item, index) => ({ ...item, sortOrder: index }))

const moveItem = (items, from, to) => {
  if (to < 0 || to >= items.length) return items
  const next = [...items]
  const [removed] = next.splice(from, 1)
  next.splice(to, 0, removed)
  return normalizeMediaItems(next)
}

export default function AdminPage({ authenticated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authenticated)
  const [password, setPassword] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const [status, setStatus] = useState('')
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [editingId, setEditingId] = useState(null)

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])
  const isEditing = Boolean(editingId)

  const resetProjectForm = () => {
    setForm(emptyForm)
    setMediaFile(null)
    setMediaItems([])
    setEditingId(null)
  }

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
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setStatus('')
    resetProjectForm()
    setProjects([])
    setContacts([])
  }

  const fetchContacts = async () => {
    const response = await fetch('/api/contact/requests')
    const payload = await response.json()
    if (response.ok) {
      setContacts(payload.items)
    }
  }

  const fetchProjects = async () => {
    const response = await fetch('/api/projects')
    const payload = await response.json()
    if (response.ok) {
      setProjects(payload.items)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchContacts()
    fetchProjects()
  }, [isAuthenticated])

  const uploadMedia = async () => {
    if (!mediaFile) {
      return null
    }

    const uploadResponse = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': mediaFile.type,
        'X-Filename': mediaFile.name,
      },
      body: mediaFile,
    })

    const payload = await uploadResponse.json()
    if (!uploadResponse.ok) {
      throw new Error(payload.error || 'Failed to upload file')
    }

    return {
      kind: payload.kind,
      title: mediaFile.name,
      url: payload.fileUrl,
      s3Key: payload.key,
      contentType: payload.contentType,
      columnSpan: 'two_columns',
    }
  }

  const addMediaToList = async () => {
    if (!mediaFile) {
      setStatus('Choose a file to upload first.')
      return
    }

    setStatus('Uploading media...')
    try {
      const uploaded = await uploadMedia()
      setMediaItems((prev) => normalizeMediaItems([...prev, uploaded]))
      setMediaFile(null)
      setStatus('Media added to project.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const submitProject = async (event) => {
    event.preventDefault()
    setStatus(isEditing ? 'Updating project...' : 'Saving project...')

    try {
      const payload = {
        ...form,
        mediaItems: normalizeMediaItems(mediaItems),
      }

      const response = await fetch(
        isEditing ? `/api/projects/${editingId}` : '/api/projects',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save project')
      }

      setStatus(isEditing ? 'Project updated.' : 'Project created.')
      resetProjectForm()
      fetchProjects()
      fetchContacts()
    } catch (error) {
      setStatus(error.message)
    }
  }

  const startEdit = (project) => {
    setEditingId(project.id)
    setForm(projectToForm(project))
    setMediaItems(projectToMediaItems(project))
    setMediaFile(null)
    setStatus('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) {
      return
    }

    setStatus('Deleting project...')
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    const payload = await response.json()
    if (!response.ok) {
      setStatus(payload.error || 'Failed to delete project')
      return
    }

    if (editingId === projectId) {
      resetProjectForm()
    }
    setStatus('Project deleted.')
    fetchProjects()
  }

  const removeMediaItem = (index) => {
    setMediaItems((prev) => normalizeMediaItems(prev.filter((_, i) => i !== index)))
  }

  const updateMediaItem = (index, patch) => {
    setMediaItems((prev) =>
      normalizeMediaItems(
        prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      ),
    )
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
          <button className={s.button} onClick={fetchProjects} type="button">
            Refresh projects
          </button>
          <button className={s.button} onClick={logout} type="button">
            Logout
          </button>
        </div>

        <section className={s.card}>
          <h2>Projects ({projects.length})</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Industry</th>
                  <th>Media</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 && (
                  <tr>
                    <td className={s.muted} colSpan={5}>
                      No projects yet.
                    </td>
                  </tr>
                )}
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.industry || '-'}</td>
                    <td>{project.media?.length || 0}</td>
                    <td>{new Date(project.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className={s.rowActions}>
                        <button
                          className={s.button}
                          type="button"
                          onClick={() => startEdit(project)}
                        >
                          Edit
                        </button>
                        <button
                          className={cn(s.button, s.danger)}
                          type="button"
                          onClick={() => deleteProject(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form className={s.card} onSubmit={submitProject}>
          <h2>{isEditing ? 'Edit project' : 'Create project'}</h2>
          {isEditing && (
            <p className={s.muted}>
              Editing project ID: {editingId}.{' '}
              <button
                className={s.linkButton}
                type="button"
                onClick={resetProjectForm}
              >
                Cancel edit
              </button>
            </p>
          )}
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
              <label>Add media (image/video)</label>
              <input
                className={s.input}
                type="file"
                accept="image/png,image/jpeg,image/webp,video/mp4"
                onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className={s.actions}>
            <button
              className={s.button}
              type="button"
              onClick={addMediaToList}
              disabled={!mediaFile}
            >
              Upload &amp; add to list
            </button>
          </div>

          {mediaItems.length > 0 && (
            <div className={s.mediaList}>
              <h3>Project media (order &amp; column width)</h3>
              {mediaItems.map((item, index) => (
                <div className={s.mediaRow} key={item.id || `${item.url}-${index}`}>
                  <div className={s.mediaPreview}>
                    {item.kind === 'video' ? (
                      <span className={s.muted}>Video: {item.title}</span>
                    ) : (
                      <img src={item.url} alt={item.title || 'Project media'} />
                    )}
                  </div>
                  <div className={s.mediaControls}>
                    <p className={s.muted}>
                      #{index + 1} · {item.title || 'Untitled'}
                    </p>
                    <label>
                      Width in row
                      <select
                        className={s.select}
                        value={item.columnSpan}
                        onChange={(event) =>
                          updateMediaItem(index, { columnSpan: event.target.value })
                        }
                      >
                        <option value="one_column">1 column</option>
                        <option value="two_columns">2 columns (full row)</option>
                      </select>
                    </label>
                    <div className={s.rowActions}>
                      <button
                        className={s.button}
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          setMediaItems((prev) => moveItem(prev, index, index - 1))
                        }
                      >
                        Move up
                      </button>
                      <button
                        className={s.button}
                        type="button"
                        disabled={index === mediaItems.length - 1}
                        onClick={() =>
                          setMediaItems((prev) => moveItem(prev, index, index + 1))
                        }
                      >
                        Move down
                      </button>
                      <button
                        className={cn(s.button, s.danger)}
                        type="button"
                        onClick={() => removeMediaItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={s.actions}>
            <button className={s.button} type="submit" disabled={!canSubmit}>
              {isEditing ? 'Save changes' : 'Create project'}
            </button>
            {isEditing && (
              <button
                className={s.button}
                type="button"
                onClick={resetProjectForm}
              >
                Cancel
              </button>
            )}
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
