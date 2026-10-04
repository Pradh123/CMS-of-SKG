import PageHeader from '../../components/layout/PageHeader.jsx'
import useAuth from '../../hooks/useAuth.js'

export default function ProfilePage() {
  const { currentUser, user } = useAuth()
  const displayName = currentUser?.name || 'Super Admin'
  const email = currentUser?.email || user || ''
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <PageHeader
        title="Profile"
        description="Review your account details and update your public information."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="card">
          <div className="flex items-center gap-5 mb-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{displayName}</h2>
              <p className="break-all text-slate-500">{email}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Full name</label>
              <input className="field" defaultValue={displayName} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Role</label>
              <input className="field" defaultValue={currentUser?.role || 'Super Admin'} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
              <input className="field" defaultValue={email} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Phone</label>
              <input
                className="field"
                defaultValue={currentUser?.phone || ''}
                placeholder="Add phone number"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="btn">Save changes</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Account status</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-700">Verified</p>
              <p className="mt-1 text-sm text-emerald-600">Your account is active and secure.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Last login</p>
              <p className="mt-1 text-sm text-slate-500">Today at 9:42 AM</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
