import { MediaDropzone } from 'components/admin/media-dropzone'
import { ProjectDrawer } from 'components/admin/project-drawer'
import { clearSessionCookie, isAdminAuthenticated } from 'lib/admin-auth'
import { uploadFileToS3 } from 'lib/admin-s3-upload'
import { parseApiResponse } from 'lib/parse-api-response'
import cn from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [mediaItems, setMediaItems] = useState([])
  const [status, setStatus] = useState('')
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('projects')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])
  const isEditing = Boolean(editingId)

  const resetProjectForm = useCallback(() => {
    setForm(emptyForm)
    setMediaItems([])
    setEditingId(null)
    setDrawerOpen(false)
    setStatus('')
  }, [])

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
    const { data: payload } = await parseApiResponse(response)
    if (response.ok) {
      setContacts(payload.items)
    }
  }

  const fetchProjects = async () => {
    const response = await fetch('/api/projects')
    const { data: payload } = await parseApiResponse(response)
    if (response.ok) {
      setProjects(payload.items)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchContacts()
    fetchProjects()
  }, [isAuthenticated])

  const uploadFile = useCallback((file) => uploadFileToS3(file), [])

  const openCreateDrawer = () => {
    setEditingId(null)
    setForm(emptyForm)
    setMediaItems([])
    setStatus('')
    setDrawerOpen(true)
  }

  const startEdit = (project) => {
    setEditingId(project.id)
    setForm(projectToForm(project))
    setMediaItems(projectToMediaItems(project))
    setStatus('')
    setDrawerOpen(true)
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
      const { data } = await parseApiResponse(response)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save project')
      }

      setStatus(isEditing ? 'Project updated.' : 'Project created.')
      resetProjectForm()
      fetchProjects()
    } catch (error) {
      setStatus(error.message)
    }
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) {
      return
    }

    setStatus('Deleting project...')
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    const { data: payload } = await parseApiResponse(response)
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
        <header className={s.topBar}>
          <h1 className={s.title}>Arteria Admin</h1>
          <div className={s.actions}>
            <button
              className={s.button}
              type="button"
              onClick={() => {
                if (activeTab === 'projects') fetchProjects()
                else fetchContacts()
              }}
            >
              Refresh
            </button>
            <button className={s.button} type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <nav className={s.tabs} aria-label="Admin sections">
          <button
            type="button"
            className={cn(s.tab, activeTab === 'projects' && s.tabActive)}
            onClick={() => setActiveTab('projects')}
          >
            Projects ({projects.length})
          </button>
          <button
            type="button"
            className={cn(s.tab, activeTab === 'contacts' && s.tabActive)}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts ({contacts.length})
          </button>
        </nav>

        {status && !drawerOpen && <p className={s.statusBanner}>{status}</p>}

        {activeTab === 'projects' && (
          <section className={s.card}>
            <div className={s.sectionHead}>
              <h2>Projects</h2>
              <button className={cn(s.button, s.buttonAccent)} type="button" onClick={openCreateDrawer}>
                Add project
              </button>
            </div>
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
                        No projects yet. Click Add project.
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
        )}

        {activeTab === 'contacts' && (
          <section className={s.card}>
            <h2>Contact requests</h2>
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
                        No contact requests yet.
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
        )}
      </div>

      <ProjectDrawer
        open={drawerOpen}
        title={isEditing ? 'Edit project' : 'New project'}
        onClose={resetProjectForm}
      >
        <form className={s.drawerForm} onSubmit={submitProject}>
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
            <div className={`${s.field} ${s.full}`}>
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
              <label>Media</label>
              <MediaDropzone
                items={mediaItems}
                onItemsChange={setMediaItems}
                onUploadFile={uploadFile}
                onStatus={setStatus}
                moveItem={moveItem}
                updateMediaItem={updateMediaItem}
                removeMediaItem={removeMediaItem}
              />
            </div>
          </div>

          <div className={s.drawerActions}>
            <button className={s.button} type="submit" disabled={!canSubmit}>
              {isEditing ? 'Save changes' : 'Create project'}
            </button>
            <button className={s.button} type="button" onClick={resetProjectForm}>
              Cancel
            </button>
          </div>
          {status && <p className={s.status}>{status}</p>}
        </form>
      </ProjectDrawer>
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
