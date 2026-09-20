import PageHeader from '../../components/layout/PageHeader.jsx'

export default function ChangePasswordPage() {
  return (
    <>
      <PageHeader
        title="Change Password"
        description="Update your password to keep your admin account protected."
      />

      <div className="card max-w-2xl">
        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Current password
            </label>
            <input type="password" className="field" placeholder="Enter current password" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">New password</label>
            <input type="password" className="field" placeholder="Enter new password" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Confirm new password
            </label>
            <input type="password" className="field" placeholder="Re-enter new password" />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Password should be 8+ characters and include a number and symbol.
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary px-4 py-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="btn px-4 py-2 rounded-lg">
              Update password
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
