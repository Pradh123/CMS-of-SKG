import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import AppToast from '../../components/common/AppToast.jsx'
import { FormSelect } from '../../components/common/FormControls.jsx'
import { settingsApi } from '../../services/apiClient.js'

const defaults = {
  notifications: true,
  emailAlerts: true,
  pushNotifications: false,
  language: 'English',
  timezone: 'UTC+05:30',
}

function Toggle({ checked, disabled, label, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.target.checked)}
      />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
    </label>
  )
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    settingsApi
      .getPreferences()
      .then(response => {
        if (active) setPreferences({ ...defaults, ...(response || {}) })
      })
      .catch(requestError => {
        if (active) setError(requestError?.message || 'Settings could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const setPreference = (name, value) => {
    setPreferences(current => ({ ...current, [name]: value }))
    setError('')
  }

  const save = async event => {
    event.preventDefault()
    if (saving || loading) return
    setSaving(true)
    setError('')
    setToast(null)
    try {
      const saved = await settingsApi.savePreferences(preferences)
      setPreferences(current => ({ ...current, ...(saved || {}) }))
      setToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Your notification and display preferences are up to date.',
      })
    } catch (requestError) {
      setError(requestError?.message || 'Settings could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const disabled = loading || saving

  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your admin experience and security preferences."
      />

      <form className="space-y-6" onSubmit={save}>
        <fieldset className="contents" disabled={disabled}>
          <div className="card">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
                <p className="text-sm text-slate-500">Choose how you receive important updates.</p>
              </div>
              <Toggle
                label="Enable notifications"
                checked={Boolean(preferences.notifications)}
                disabled={disabled}
                onChange={value => setPreference('notifications', value)}
              />
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Email alerts</span>
                <Toggle
                  label="Email alerts"
                  checked={Boolean(preferences.emailAlerts)}
                  disabled={disabled || !preferences.notifications}
                  onChange={value => setPreference('emailAlerts', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Push notifications</span>
                <Toggle
                  label="Push notifications"
                  checked={Boolean(preferences.pushNotifications)}
                  disabled={disabled || !preferences.notifications}
                  onChange={value => setPreference('pushNotifications', value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800">Preferences</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Language</label>
                <FormSelect
                  triggerClassName="field"
                  aria-label="Language"
                  value={preferences.language}
                  onChange={event => setPreference('language', event.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </FormSelect>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Timezone</label>
                <FormSelect
                  triggerClassName="field"
                  aria-label="Timezone"
                  value={preferences.timezone}
                  onChange={event => setPreference('timezone', event.target.value)}
                >
                  <option>UTC+05:30</option>
                  <option>UTC+00:00</option>
                  <option>UTC-05:00</option>
                </FormSelect>
              </div>
            </div>
            {error && (
              <p
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button className="btn" type="submit" disabled={disabled}>
                {loading ? 'Loading…' : saving ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
      <AppToast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
