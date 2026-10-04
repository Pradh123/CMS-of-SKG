import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  UploadCloud,
  UserRound,
  UsersRound,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { crmModules } from '../../config/crmModules.js'
import { readCrudRecords } from '../../hooks/useCrudRecords.js'
import { FormDatePicker, FormSelect } from '../../components/common/FormControls.jsx'
import AppToast from '../../components/common/AppToast.jsx'

const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100'
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600'

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { users, createUser, updateUser } = useAuth()
  const user = id ? users.find(item => item.id === id) : null
  const branchOptions = [
    ...new Set(
      [
        ...readCrudRecords(crmModules.branches).map(branch => branch.branchName),
        user?.branch,
      ].filter(Boolean)
    ),
  ]
  const [toast, setToast] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photo || '')
  const [photoName, setPhotoName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(
    () => () => {
      if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    },
    [photoPreview]
  )

  const handlePhotoChange = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoName(file.name)
  }

  const save = async event => {
    event.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(event.currentTarget)
      const data = Object.fromEntries(formData)
      data.name = `${data.firstName} ${data.lastName}`.trim()
      const image = formData.get('photo')

      if (image?.size) {
        data.photo = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(image)
        })
      } else data.photo = user?.photo || ''

      if (
        !user &&
        users.some(item => item.email.toLowerCase() === data.email.trim().toLowerCase())
      ) {
        setToast({
          type: 'error',
          title: 'Email already in use',
          message: 'Choose a different email address for this user.',
        })
        setSaving(false)
        return
      }

      if (user) updateUser(user.id, data)
      else createUser(data)
      setToast({
        type: 'success',
        title: user ? 'Changes saved' : 'User added',
        message: user
          ? 'The user’s profile and access details are now up to date.'
          : 'The new user can now access their account.',
      })
      window.setTimeout(() => navigate('/users'), 900)
    } catch {
      setToast({ type: 'error', message: 'We could not save this user. Please try again.' })
      setSaving(false)
    }
  }

  const iconField = (Icon, input) => (
    <span className="relative block">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />
      {input}
    </span>
  )

  if (id && !user)
    return (
      <PageHeader
        title="User not found"
        description="This user may have been removed."
        action={
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm"
            to="/users"
          >
            <ArrowLeft size={16} /> Back to users
          </Link>
        }
      />
    )

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <PageHeader
        title={user ? 'Edit User' : 'Add User'}
        description={
          user
            ? 'Update profile and access information for this account.'
            : 'Create a new team member and configure their access.'
        }
        action={
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            to="/users"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to users</span>
            <span className="sm:hidden">Back</span>
          </Link>
        }
      />

      <form
        onSubmit={save}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.06)]"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white px-5 py-5 sm:px-7 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-200">
              <UsersRound size={21} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">User profile</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Enter personal details and account access. Fields marked with * are required.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-x-6 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7 lg:px-8 lg:py-8">
          <label>
            <span className={labelClass}>First name *</span>
            {iconField(
              UserRound,
              <input
                className={inputClass}
                name="firstName"
                autoComplete="given-name"
                placeholder="Enter first name"
                required
                defaultValue={
                  user?.firstName || user?.name?.split(' ').slice(0, -1).join(' ') || ''
                }
              />
            )}
          </label>
          <label>
            <span className={labelClass}>Last name *</span>
            {iconField(
              UserRound,
              <input
                className={inputClass}
                name="lastName"
                autoComplete="family-name"
                placeholder="Enter last name"
                required
                defaultValue={user?.lastName || user?.name?.split(' ').slice(-1).join(' ') || ''}
              />
            )}
          </label>

          <fieldset>
            <legend className={labelClass}>Gender *</legend>
            <div className="grid grid-cols-3 gap-2">
              {['Female', 'Male', 'Other'].map(gender => (
                <label key={gender} className="group cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="gender"
                    value={gender}
                    required
                    defaultChecked={user?.gender === gender}
                  />
                  <span className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600 transition group-hover:border-sky-200 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100 sm:text-sm">
                    {gender}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span className={labelClass}>User type *</span>
            <span className="relative block">
              <BriefcaseBusiness
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <FormSelect
                triggerClassName={`${inputClass} pr-11`}
                name="role"
                required
                defaultValue={user?.role || 'Admin'}
              >
                <option>Admin</option>
                <option>Inquiry</option>
                <option>Super Admin</option>
              </FormSelect>
            </span>
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>User branch</span>
            <span className="relative block">
              <Building2
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <FormSelect
                triggerClassName={`${inputClass} pr-11`}
                name="branch"
                defaultValue={user?.branch || ''}
                placeholder="Select branch"
              >
                <option value="">Select branch</option>
                {branchOptions.map(branch => (
                  <option key={branch}>{branch}</option>
                ))}
              </FormSelect>
            </span>
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Email address *</span>
            {iconField(
              Mail,
              <input
                className={inputClass}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                required
                defaultValue={user?.email || ''}
              />
            )}
          </label>
          <label>
            <span className={labelClass}>Mobile number</span>
            {iconField(
              Phone,
              <input
                className={inputClass}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                defaultValue={user?.phone || ''}
              />
            )}
          </label>
          <label>
            <span className={labelClass}>Date of birth</span>
            <FormDatePicker
              name="dob"
              defaultValue={user?.dob || ''}
              triggerClassName={`${inputClass} px-4`}
              placeholder="Select date of birth"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            {iconField(
              MapPin,
              <input
                className={inputClass}
                name="address"
                autoComplete="street-address"
                placeholder="Enter complete address"
                defaultValue={user?.address || ''}
              />
            )}
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Profile image</span>
            <span className="flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-4 transition hover:border-sky-400 hover:bg-sky-50">
              {photoPreview ? (
                <img
                  className="h-14 w-14 shrink-0 rounded-xl border-2 border-white object-cover shadow-sm"
                  src={photoPreview}
                  alt="Profile preview"
                />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-sky-600 shadow-sm">
                  <UploadCloud size={22} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-700">
                  {photoName || (user?.photo ? 'Change profile image' : 'Choose a profile image')}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  PNG, JPG or WEBP. Click to browse your device.
                </span>
              </span>
              <input
                className="sr-only"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-5 sm:flex-row sm:justify-end sm:px-7 lg:px-8">
          <Link
            to="/users"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            disabled={saving}
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {saving ? 'Saving...' : user ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>

      <AppToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
