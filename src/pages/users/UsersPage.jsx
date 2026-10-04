import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  UserRound,
  Pencil,
  Trash2,
  RotateCcw,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Modal from '../../components/common/Modal.jsx'
import '../../styles/users.css'

export default function UsersPage() {
  const navigate = useNavigate()
  const { users, deleteUser, updateUser, impersonateUser } = useAuth()
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const filteredUsers = useMemo(
    () =>
      users.filter(user =>
        `${user.name} ${user.email} ${user.phone || ''} ${user.role}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      ),
    [users, query]
  )
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const pageUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const updateBlockedState = user => updateUser(user.id, { blocked: !user.blocked })

  const loginAsUser = user => {
    if (impersonateUser(user.id)) {
      window.setTimeout(() => navigate('/', { replace: true }), 0)
    }
  }

  return (
    <div className="users-page">
      <PageHeader
        title="Users"
        description="Manage admin accounts and their status."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700"
              to="/permissions"
            >
              <ShieldCheck size={17} /> Permissions
            </Link>
            <Link className="users-add-button" to="/users/create">
              <Plus size={17} /> Add User
            </Link>
          </div>
        }
      />
      <section className="users-table-card">
        <div className="users-table-title">
          <span className="users-title-icon">
            <UserRound size={19} />
          </span>
          <h2>List of Users</h2>
          <label className="users-search">
            <span>Search:</span>
            <span className="users-search-input">
              <input
                value={query}
                onChange={event => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                aria-label="Search users"
              />
              <Search size={16} />
            </span>
          </label>
        </div>
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Registered Date</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Number</th>
                <th>Email</th>
                <th>Login Type</th>
                <th>Branch</th>
                <th>Block</th>
                <th>Permissions</th>
                <th>Login as</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : '—'}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.gender || '—'}</td>
                  <td>{user.phone || '—'}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.branch || '—'}</td>
                  <td>
                    <button
                      className={`users-icon-button ${user.blocked ? 'unblock' : 'block'}`}
                      title={user.blocked ? 'Unblock user' : 'Block user'}
                      aria-label={`${user.blocked ? 'Unblock' : 'Block'} ${user.name}`}
                      disabled={user.role === 'Super Admin'}
                      onClick={() => updateBlockedState(user)}
                    >
                      {user.blocked ? <RotateCcw size={16} /> : <span>✓</span>}
                    </button>
                  </td>
                  <td>
                    {user.role === 'Super Admin' ? (
                      <span className="text-xs font-semibold text-slate-400">Full access</span>
                    ) : (
                      <button
                        className="users-icon-button edit"
                        title="Manage permissions"
                        aria-label={`Manage ${user.name} permissions`}
                        onClick={() => navigate(`/permissions?user=${user.id}`)}
                      >
                        <ShieldCheck size={16} />
                      </button>
                    )}
                  </td>
                  <td>
                    {user.role === 'Super Admin' ? (
                      <span className="text-xs text-slate-400">Current</span>
                    ) : (
                      <button
                        className="users-icon-button unblock"
                        disabled={user.blocked}
                        title={user.blocked ? 'Unblock this user first' : `Login as ${user.name}`}
                        aria-label={`Login as ${user.name}`}
                        onClick={() => loginAsUser(user)}
                      >
                        <LogIn size={16} />
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      className="users-icon-button edit"
                      title="Edit user"
                      aria-label={`Edit ${user.name}`}
                      disabled={user.role === 'Super Admin'}
                      onClick={() => navigate(`/users/${user.id}/edit`)}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                  <td>
                    <button
                      className="users-icon-button delete"
                      title="Delete user"
                      aria-label={`Delete ${user.name}`}
                      disabled={user.role === 'Super Admin'}
                      onClick={() => setModal({ deleting: user })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!pageUsers.length && (
                <tr>
                  <td colSpan="12" className="users-no-results">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="users-mobile-list">
          {pageUsers.map(user => {
            const isSuperAdmin = user.role === 'Super Admin'

            return (
              <article className="users-mobile-card" key={user.id}>
                <div className="users-mobile-card-heading">
                  <span className="users-mobile-avatar" aria-hidden="true">
                    {user.name
                      .split(' ')
                      .map(part => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong>{user.name}</strong>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </div>
                  <span className={`users-mobile-state ${user.blocked ? 'is-blocked' : ''}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <dl className="users-mobile-details">
                  <div>
                    <dt>Role</dt>
                    <dd>{user.role}</dd>
                  </div>
                  <div>
                    <dt>Branch</dt>
                    <dd>{user.branch || '—'}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{user.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt>Registered</dt>
                    <dd>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : '—'}
                    </dd>
                  </div>
                </dl>
                <div className="users-mobile-actions">
                  <button
                    className={`users-icon-button ${user.blocked ? 'unblock' : 'block'}`}
                    disabled={isSuperAdmin}
                    onClick={() => updateBlockedState(user)}
                  >
                    {user.blocked ? <RotateCcw size={16} /> : <span>✓</span>}
                    {user.blocked ? 'Unblock' : 'Block'}
                  </button>
                  {!isSuperAdmin && (
                    <button
                      className="users-icon-button edit"
                      onClick={() => navigate(`/permissions?user=${user.id}`)}
                    >
                      <ShieldCheck size={16} /> Permissions
                    </button>
                  )}
                  {!isSuperAdmin && (
                    <button
                      className="users-icon-button unblock"
                      disabled={user.blocked}
                      onClick={() => loginAsUser(user)}
                    >
                      <LogIn size={16} /> Login as
                    </button>
                  )}
                  <button
                    className="users-icon-button edit"
                    disabled={isSuperAdmin}
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    className="users-icon-button delete"
                    disabled={isSuperAdmin}
                    onClick={() => setModal({ deleting: user })}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            )
          })}
          {!pageUsers.length && <p className="users-mobile-empty">No users found.</p>}
        </div>
        <footer className="users-table-footer">
          <span>
            Showing {filteredUsers.length ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
          </span>
          <div>
            <button disabled={page <= 1} onClick={() => setPage(current => current - 1)}>
              Previous
            </button>
            <strong>{page}</strong>
            <button disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}>
              Next
            </button>
          </div>
        </footer>
      </section>
      <Modal open={!!modal?.deleting} title="Delete User" onClose={() => setModal(null)}>
        <p className="users-delete-copy">Delete {modal?.deleting?.name} from user management?</p>
        <div className="users-form-actions">
          <button onClick={() => setModal(null)}>Cancel</button>
          <button
            className="users-confirm-delete"
            onClick={() => {
              deleteUser(modal.deleting.id)
              setModal(null)
            }}
          >
            Delete User
          </button>
        </div>
      </Modal>
    </div>
  )
}
