import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, UserRound, Pencil, Trash2, RotateCcw } from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Modal from '../../components/common/Modal.jsx'
import '../../styles/users.css'

export default function UsersPage() {
  const navigate = useNavigate()
  const { users, createUser, deleteUser, updateUser } = useAuth()
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

  return (
    <div className="users-page">
      <PageHeader
        title="Users"
        description="Manage admin accounts and their status."
        action={
          <Link className="users-add-button" to="/users/create">
            <Plus size={17} /> Add User
          </Link>
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
                      onClick={() => updateUser(user.id, { blocked: !user.blocked })}
                    >
                      {user.blocked ? <RotateCcw size={16} /> : <span>✓</span>}
                    </button>
                  </td>
                  <td>
                    <button
                      className="users-icon-button edit"
                      title="Edit user"
                      aria-label={`Edit ${user.name}`}
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
                      onClick={() => setModal({ deleting: user })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!pageUsers.length && (
                <tr>
                  <td colSpan="10" className="users-no-results">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
