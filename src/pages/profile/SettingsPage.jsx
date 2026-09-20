import PageHeader from '../../components/layout/PageHeader.jsx'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your admin experience and security preferences."
      />

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
              <p className="text-sm text-slate-500">Choose how you receive important updates.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600"></span>
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
            </label>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Email alerts</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600"></span>
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Push notifications</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600"></span>
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Preferences</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Language</label>
              <select className="field">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Timezone</label>
              <select className="field">
                <option>UTC+05:30</option>
                <option>UTC+00:00</option>
                <option>UTC-05:00</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn">Save settings</button>
          </div>
        </div>
      </div>
    </>
  )
}
