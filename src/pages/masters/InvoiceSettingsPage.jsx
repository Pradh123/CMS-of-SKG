import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  QrCode,
  Save,
  Smartphone,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import useAuth from '../../hooks/useAuth.js'
import { settingsApi } from '../../services/apiClient.js'

const emptySettings = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  upiId: '',
  qrImage: '',
}

const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100'
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600'
const MAX_QR_IMAGE_BYTES = 2 * 1024 * 1024
const QR_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function Field({ icon: Icon, label, children }) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        {children}
      </span>
    </label>
  )
}

export default function InvoiceSettingsPage() {
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('/masters/invoice-settings', 'edit')
  const [settings, setSettings] = useState(emptySettings)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    settingsApi
      .getInvoice()
      .then(result => {
        if (active) setSettings({ ...emptySettings, ...(result?.settings || result) })
      })
      .catch(requestError => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!saved) return undefined
    const timer = window.setTimeout(() => setSaved(false), 3200)
    return () => window.clearTimeout(timer)
  }, [saved])

  const update = event => {
    const { name, value } = event.target
    setSettings(current => ({ ...current, [name]: value }))
  }

  const updateQr = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!QR_IMAGE_TYPES.has(file.type)) {
      setError('Please choose a PNG, JPG, or WEBP image.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_QR_IMAGE_BYTES) {
      setError('QR images must be no larger than 2 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSettings(current => ({ ...current, qrImage: reader.result }))
      setError('')
    }
    reader.onerror = () => setError('The QR image could not be read. Please try another file.')
    reader.readAsDataURL(file)
  }

  const save = async event => {
    event.preventDefault()
    if (!canEdit) return
    try {
      const result = await settingsApi.saveInvoice(settings)
      setSettings({ ...emptySettings, ...(result?.settings || result) })
      setError('')
      setSaved(true)
    } catch (requestError) {
      setError(requestError?.message || 'Settings could not be saved. Please check the details.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <PageHeader
        title="Invoice Settings"
        description="Configure the bank and payment details shown on generated invoices."
      />

      <form
        onSubmit={save}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.06)]"
      >
        <header className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white px-5 py-5 sm:px-7 lg:px-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-200">
              <Landmark size={21} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">Payment details</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Keep these details accurate before creating or printing an invoice.
              </p>
            </div>
          </div>
        </header>

        {!canEdit && (
          <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700 sm:px-7 lg:px-8">
            You have view-only access. Ask a Super Admin for Edit permission to change payment
            details.
          </p>
        )}
        <fieldset disabled={!canEdit}>
          <div className="grid gap-x-6 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7 lg:px-8 lg:py-8">
            <Field icon={Landmark} label="Bank name">
              <input
                className={inputClass}
                name="bankName"
                placeholder="Enter bank name"
                value={settings.bankName}
                onChange={update}
                required
              />
            </Field>
            <Field icon={UserRound} label="Account name">
              <input
                className={inputClass}
                name="accountName"
                placeholder="Enter account holder name"
                value={settings.accountName}
                onChange={update}
                required
              />
            </Field>
            <Field icon={CreditCard} label="Account number">
              <input
                className={inputClass}
                name="accountNumber"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Enter account number"
                value={settings.accountNumber}
                onChange={update}
                required
              />
            </Field>
            <Field icon={CreditCard} label="IFSC code">
              <input
                className={`${inputClass} uppercase`}
                name="ifscCode"
                autoCapitalize="characters"
                placeholder="e.g. ICIC0000004"
                value={settings.ifscCode}
                onChange={update}
                required
              />
            </Field>
            <Field icon={Building2} label="Branch">
              <input
                className={inputClass}
                name="branchName"
                placeholder="Enter bank branch"
                value={settings.branchName}
                onChange={update}
              />
            </Field>
            <Field icon={Smartphone} label="UPI ID">
              <input
                className={inputClass}
                name="upiId"
                placeholder="business@bank"
                value={settings.upiId}
                onChange={update}
              />
            </Field>

            <div className="sm:col-span-2">
              <span className={labelClass}>Invoice QR image</span>
              <div className="grid gap-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-4 text-left"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-sky-600 shadow-sm">
                    {settings.qrImage ? (
                      <img
                        className="h-full w-full object-cover"
                        src={settings.qrImage}
                        alt="Invoice payment QR preview"
                      />
                    ) : (
                      <UploadCloud size={22} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-700">
                      {settings.qrImage ? 'Replace QR image' : 'Upload QR image'}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      PNG, JPG, or WEBP. A square image works best on invoices.
                    </span>
                  </span>
                </button>
                {settings.qrImage && (
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    onClick={() => {
                      setSettings(current => ({ ...current, qrImage: '' }))
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                  >
                    <X size={15} /> Remove
                  </button>
                )}
                <input
                  ref={fileRef}
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={updateQr}
                />
              </div>
            </div>

            {error && (
              <p
                className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-8">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <QrCode size={15} /> Changes apply to invoices created in this workspace.
            </p>
            <button
              disabled={!canEdit}
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105"
            >
              {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
              {saved ? 'Settings saved' : 'Save settings'}
            </button>
          </footer>
        </fieldset>
      </form>
    </div>
  )
}
