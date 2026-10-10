import PageHeader from '../../components/layout/PageHeader.jsx'

export default function UsersSkeleton() {
  return (
    <div className="users-page" role="status" aria-label="Loading users" aria-busy="true">
      <PageHeader title="Users" description="Manage admin accounts and their status." />
      <section className="users-table-card" aria-hidden="true">
        <div className="users-table-title">
          <span className="users-title-icon skeleton" />
          <h2>List of Users</h2>
          <span className="skeleton skeleton-users-search" />
        </div>
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                {[
                  'Registered Date',
                  'Name',
                  'Gender',
                  'Number',
                  'Email',
                  'Login Type',
                  'Branch',
                  'Block',
                  'Permissions',
                  'Login as',
                  'Edit',
                  'Delete',
                ].map(label => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: 12 }, (_, column) => (
                    <td key={column}>
                      <span
                        className={`skeleton skeleton-user-cell ${column >= 7 ? 'skeleton-user-action' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="users-mobile-list">
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} className="users-mobile-card">
              <div className="users-mobile-card-heading">
                <span className="users-mobile-avatar skeleton" />
                <span className="skeleton skeleton-user-cell" />
              </div>
              <div className="skeleton-grid">
                {[0, 1, 2].map(line => (
                  <span key={line} className="skeleton skeleton-line" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton-users-footer">
          <span className="skeleton skeleton-user-cell" />
          <span className="skeleton skeleton-users-search" />
        </div>
      </section>
    </div>
  )
}
