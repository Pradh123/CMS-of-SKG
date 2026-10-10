import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import AppToast from '../../components/common/AppToast.jsx'
import useAuth from '../../hooks/useAuth.js'

function formatLogin(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function ProfilePage() {
  const { currentUser, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    })
  }, [currentUser?.email, currentUser?.name, currentUser?.phone])

  const displayName = currentUser?.name || currentUser?.email || 'Admin User'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  const update = event =>
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const save = async event => {
    event.preventDefault()
    if (!currentUser?.id || saving) return
    setSaving(true)
    setToast(null)
    const saved = await updateUser(currentUser.id, {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    })
    setSaving(false)
    setToast(
      saved
        ? {
            type: 'success',
            title: 'Profile updated',
            message: 'Your account details have been saved.',
          }
        : {
            type: 'error',
            message: 'Your profile could not be updated. Please check the details and try again.',
          }
    )
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Review your account details and update your public information."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <form className="card" onSubmit={save}>
          <div className="mb-7 flex items-center gap-5">
            {currentUser?.photo ? (
              <img
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                src={currentUser.photo}
                alt=""
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                {initials || 'AD'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{displayName}</h2>
              <p className="break-all text-slate-500">{currentUser?.email || ''}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-600"
                htmlFor="profile-name"
              >
                Full name
              </label>
              <input
                id="profile-name"
                name="name"
                className="field"
                value={form.name}
                onChange={update}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-600"
                htmlFor="profile-role"
              >
                Role
              </label>
              <input
                id="profile-role"
                className="field disabled:cursor-not-allowed disabled:bg-slate-100"
                value={currentUser?.role || 'Administrator'}
                disabled
                readOnly
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-600"
                htmlFor="profile-email"
              >
                Email
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                className="field"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-600"
                htmlFor="profile-phone"
              >
                Phone
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                className="field"
                value={form.phone}
                onChange={update}
                autoComplete="tel"
                placeholder="Add phone number"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Account status</h3>
          <div className="mt-5 space-y-4">
            <div
              className={`rounded-xl border p-4 ${
                currentUser?.blocked
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-emerald-200 bg-emerald-50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  currentUser?.blocked ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {currentUser?.blocked ? 'Blocked' : 'Active'}
              </p>
              <p
                className={`mt-1 text-sm ${
                  currentUser?.blocked ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {currentUser?.blocked
                  ? 'This account is currently blocked.'
                  : 'Your account is active.'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Last login</p>
              <p className="mt-1 text-sm text-slate-500">{formatLogin(currentUser?.lastLoginAt)}</p>
            </div>
          </div>
        </div>
      </div>
      <AppToast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
