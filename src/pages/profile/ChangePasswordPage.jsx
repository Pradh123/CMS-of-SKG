import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import AppToast from '../../components/common/AppToast.jsx'
import useAuth from '../../hooks/useAuth.js'

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const update = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  const submit = async event => {
    event.preventDefault()
    if (saving) return
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (
      form.newPassword.length < 8 ||
      form.newPassword.length > 128 ||
      !/[a-z]/.test(form.newPassword) ||
      !/[A-Z]/.test(form.newPassword) ||
      !/\d/.test(form.newPassword) ||
      !/[^A-Za-z0-9]/.test(form.newPassword)
    ) {
      setError('Use 8-128 characters with uppercase, lowercase, a number, and a symbol.')
      return
    }

    setSaving(true)
    setError('')
    setToast(null)
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setForm(emptyForm)
      setToast({
        type: 'success',
        title: 'Password updated',
        message: 'Your new password is active. Other sessions have been signed out.',
      })
    } catch (requestError) {
      setError(requestError?.message || 'Password could not be updated. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Change Password"
        description="Update your password to keep your admin account protected."
      />

      <div className="card max-w-2xl">
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-600"
              htmlFor="current-password"
            >
              Current password
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="field"
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={update}
              disabled={saving}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              className="field"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={update}
              disabled={saving}
              minLength="8"
              maxLength="128"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,128}"
              required
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-600"
              htmlFor="confirm-password"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="field"
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={update}
              disabled={saving}
              minLength="8"
              maxLength="128"
              required
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Use 8-128 characters with uppercase, lowercase, a number, and a symbol.
          </div>
          {error && (
            <p
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary rounded-lg px-4 py-2"
              onClick={() => {
                setForm(emptyForm)
                setError('')
              }}
              disabled={saving}
            >
              Clear
            </button>
            <button type="submit" className="btn rounded-lg px-4 py-2" disabled={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
      <AppToast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
