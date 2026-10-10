import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlignLeft,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardPenLine,
  Clock3,
  FileText,
  Hash,
  Image as ImageIcon,
  IndianRupee,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import PageHeader from '../layout/PageHeader.jsx'
import { FormDatePicker, FormSelect } from '../common/FormControls.jsx'
import useCrudRecords from '../../hooks/useCrudRecords.js'
import { getAccessToken, lookupsApi } from '../../services/apiClient.js'
import {
  fileName,
  fileUrl,
  getFields,
  getOptions,
  getRecordName,
  getSections,
  inputClass,
  isBlank,
  isImageValue,
  labelClass,
  CrudToast,
  optionLabel,
  optionValue,
} from './crmShared.jsx'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const LOOKUP_CACHE_MS = 10_000
const LOOKUP_KEYS = ['vehicles', 'drivers', 'vendors', 'parties']
const lookupCache = new Map()
const lookupRequests = new Map()

async function loadLookup(key) {
  const token = getAccessToken()
  const cached = lookupCache.get(key)
  if (cached && cached.token === token && Date.now() - cached.loadedAt < LOOKUP_CACHE_MS) {
    return cached.records
  }
  const requestKey = `${token}:${key}`
  if (!lookupRequests.has(requestKey)) {
    const request = lookupsApi
      .list(key)
      .then(records => {
        lookupCache.set(key, { records, loadedAt: Date.now(), token })
        return records
      })
      .finally(() => lookupRequests.delete(requestKey))
    lookupRequests.set(requestKey, request)
  }
  return lookupRequests.get(requestKey)
}

function useLookupReferences(keys) {
  const requestKey = keys.join('|')
  const [references, setReferences] = useState(() =>
    Object.fromEntries(
      LOOKUP_KEYS.map(key => {
        const cached = lookupCache.get(key)
        return [key, cached?.token === getAccessToken() ? cached.records : []]
      })
    )
  )
  const [errors, setErrors] = useState({})
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    let active = true
    keys.forEach(key => {
      loadLookup(key)
        .then(records => {
          if (active) {
            setReferences(current => ({ ...current, [key]: records }))
            setErrors(current => {
              const next = { ...current }
              delete next[key]
              return next
            })
          }
        })
        .catch(error => {
          if (active) {
            setReferences(current => ({ ...current, [key]: [] }))
            setErrors(current => ({ ...current, [key]: error }))
          }
        })
    })
    return () => {
      active = false
    }
  }, [requestKey, retryVersion])

  return {
    references,
    errors,
    retry: () => setRetryVersion(version => version + 1),
  }
}

function cleanPath(path = '') {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function initialValues(fields, record) {
  return fields.reduce((values, field) => {
    if (record && record[field.name] !== undefined) values[field.name] = record[field.name]
    else if (field.defaultValue !== undefined) values[field.name] = field.defaultValue
    else values[field.name] = field.type === 'checkbox' ? false : ''
    return values
  }, {})
}

function asNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function asMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function withCalculatedValues(config, values) {
  const calculated = { ...values }

  if (config?.key === 'tripsPickupDrop') {
    calculated.totalRate = asMoney(asNumber(values.rate) * asNumber(values.totalKm))
  }

  if (config?.key === 'fuel') {
    calculated.totalAmount = asMoney(asNumber(values.liters) * asNumber(values.pricePerUnit))
  }

  if (config?.key === 'invoices') {
    const serviceAmount = asMoney(asNumber(values.serviceQuantity) * asNumber(values.serviceRate))
    const extraKmAmount = asMoney(asNumber(values.extraKmDriven) * asNumber(values.extraKmRate))
    const subTotalAmount = asMoney(serviceAmount + asNumber(values.driverDa) + extraKmAmount)
    const totalAmount = asMoney(subTotalAmount + (subTotalAmount * asNumber(values.gst)) / 100)

    calculated.serviceAmount = serviceAmount
    calculated.subTotalAmount = subTotalAmount
    calculated.totalAmount = totalAmount
  }

  return calculated
}

function recordLabel(record, keys) {
  return keys
    .map(key => record?.[key])
    .filter(Boolean)
    .join(' ')
    .trim()
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean).map(String))]
}

function withLinkedOptions(config, field, currentValue, references) {
  let linked = []
  let linkedSource = false

  if (field.name === 'vehicleNumber' && config?.key !== 'vehicles') {
    linkedSource = true
    linked = references.vehicles.map(record => recordLabel(record, ['registrationNumber']))
  } else if (field.name === 'driverName' && config?.key === 'vehicles') {
    linkedSource = true
    linked = references.drivers.map(record => recordLabel(record, ['firstName', 'lastName']))
  } else if (field.name === 'vendor' && config?.key === 'fuel') {
    linkedSource = true
    linked = references.vendors.map(record => recordLabel(record, ['vendorName']))
  } else if (['partyName', 'clientName'].includes(field.name)) {
    linkedSource = true
    linked = references.parties.map(record => recordLabel(record, ['corporateName']))
  }

  if (!linkedSource) return field
  const choices = uniqueOptions([...linked, currentValue])
  return field.type === 'select'
    ? { ...field, options: choices }
    : { ...field, suggestions: choices }
}

function defaultDocumentStatus(values) {
  const expiryDates = [values.registrationUpto, values.insuranceValidUpto, values.pucValidUpto]
    .filter(Boolean)
    .map(value => new Date(`${value}T00:00:00`))
    .filter(date => !Number.isNaN(date.getTime()))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!expiryDates.length && !values.rcBook && !values.insurance && !values.puc) {
    return 'Missing docs'
  }
  if (expiryDates.some(date => date < today)) return 'Expired'
  const dueSoon = new Date(today)
  dueSoon.setDate(dueSoon.getDate() + 30)
  if (expiryDates.some(date => date <= dueSoon)) return 'Renewal due'
  return 'Up to date'
}

function withRecordDefaults(config, values, record, references) {
  const prepared = withCalculatedValues(config, values)
  const today = new Date().toISOString().slice(0, 10)

  if (config?.key === 'vehicles') {
    prepared.kmsDone = record?.kmsDone ?? 0
    prepared.documentStatus = record?.documentStatus || defaultDocumentStatus(prepared)
    prepared.lastTrip = record?.lastTrip || 'No trips yet'
    prepared.status = record?.status || 'Active'
  }

  if (config?.key === 'parties') {
    prepared.registeredDate = record?.registeredDate || today
    prepared.status = record?.status || 'Active'
  }

  if (['tripsRegular', 'tripsPickupDrop'].includes(config?.key)) {
    const vehicle = references.vehicles.find(
      item => String(item.registrationNumber) === String(prepared.vehicleNumber)
    )
    prepared.driverName = vehicle?.driverName || record?.driverName || 'Unassigned'
  }

  if (config?.key === 'cities') {
    prepared.routes = record?.routes ?? 0
    prepared.status = prepared.published ? 'Published' : prepared.active ? 'Active' : 'Inactive'
  }

  return prepared
}

function fieldIcon(field) {
  const name = `${field.name || ''} ${field.label || ''}`.toLowerCase()
  if (field.type === 'email') return Mail
  if (field.type === 'tel' || /phone|mobile|contact/.test(name)) return Phone
  if (field.type === 'date' || field.type === 'datetime-local') return CalendarDays
  if (field.type === 'time') return Clock3
  if (field.type === 'number' || /number|amount|price|fare|salary|cost/.test(name))
    return /amount|price|fare|salary|cost/.test(name) ? IndianRupee : Hash
  if (/address|city|state|location/.test(name)) return MapPin
  if (/name|driver|vendor|party|person/.test(name)) return UserRound
  if (field.type === 'textarea') return AlignLeft
  return FileText
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        dataUrl: reader.result,
      })
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

export default function CrudFormPage({ config }) {
  const params = useParams()
  const id = params.id ?? params.recordId
  const navigate = useNavigate()
  const { records, loading, createRecord, updateRecord } = useCrudRecords(config)
  const fields = useMemo(() => getFields(config), [config])
  const lookupKeys = useMemo(() => {
    const keys = new Set()
    fields.forEach(field => {
      if (field.name === 'vehicleNumber' && config?.key !== 'vehicles') keys.add('vehicles')
      if (field.name === 'driverName' && config?.key === 'vehicles') keys.add('drivers')
      if (field.name === 'vendor' && config?.key === 'fuel') keys.add('vendors')
      if (['partyName', 'clientName'].includes(field.name)) keys.add('parties')
    })
    return [...keys]
  }, [config?.key, fields])
  const { references, errors: lookupErrors, retry: retryLookups } = useLookupReferences(lookupKeys)
  const failedLookups = Object.keys(lookupErrors)
  const sections = useMemo(() => getSections(config), [config])
  const record = id ? records.find(item => String(item.id) === String(id)) : null
  const [values, setValues] = useState(() => initialValues(fields, record))
  const [saving, setSaving] = useState(false)
  const [readingFiles, setReadingFiles] = useState([])
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])
  const basePath = cleanPath(config?.path)
  const editing = Boolean(id)
  const displayValues = useMemo(() => withCalculatedValues(config, values), [config, values])

  useEffect(() => {
    setValues(initialValues(fields, record))
  }, [config?.key, id, record, fields])

  const setValue = (name, value) => setValues(current => ({ ...current, [name]: value }))

  const handleFile = async (field, file) => {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setToast({
        type: 'error',
        message: `“${file.name}” is over 2 MB. Please choose a smaller file.`,
      })
      return
    }
    if (field.accept && !fileMatchesAccept(file, field.accept)) {
      setToast({ type: 'error', message: `“${file.name}” is not a supported file type.` })
      return
    }

    setReadingFiles(current => [...current, field.name])
    try {
      setValue(field.name, await readFile(file))
    } catch {
      setToast({
        type: 'error',
        message: `We could not read ${file.name}. Please choose it again.`,
      })
    } finally {
      setReadingFiles(current => current.filter(name => name !== field.name))
    }
  }

  const save = async event => {
    event.preventDefault()
    const missing = fields.find(
      field =>
        field.required &&
        !field.readOnly &&
        (field.type === 'checkbox'
          ? !values[field.name]
          : isBlank(values[field.name]) ||
            (typeof values[field.name] === 'string' && !values[field.name].trim()))
    )
    if (missing) {
      setToast({
        type: 'error',
        title: 'One detail is missing',
        message: `Please enter ${String(missing.label || missing.name).toLowerCase()} before continuing.`,
      })
      document.getElementById(`crm-${missing.name}`)?.focus()
      return
    }

    setSaving(true)
    try {
      const payload = withRecordDefaults(config, values, record, references)
      if (config?.key === 'invoices' && isBlank(payload.customerId)) {
        payload.customerId = `CUST-${Date.now().toString().slice(-7)}`
      }
      fields.forEach(field => {
        if (field.type === 'number' && payload[field.name] !== '')
          payload[field.name] = Number(payload[field.name])
        if (typeof payload[field.name] === 'string')
          payload[field.name] = payload[field.name].trim()
      })

      const saved = editing ? await updateRecord(id, payload) : await createRecord(payload)
      if (!saved) throw new Error('Record not found')
      setToast({
        type: 'success',
        title: editing ? 'Changes saved' : `${config?.singular || 'Record'} added`,
        message: editing
          ? `${config?.singular || 'Record'} details are now up to date.`
          : `${config?.singular || 'Record'} is ready to use.`,
      })
      window.setTimeout(() => navigate(basePath), 750)
    } catch (error) {
      setToast({
        type: 'error',
        message:
          error?.message ||
          `The ${String(config?.singular || 'record').toLowerCase()} could not be saved. Please try again.`,
      })
      setSaving(false)
    }
  }

  if (!config?.key || !config?.path) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
        This page needs a valid CRM configuration with a key and path.
      </div>
    )
  }

  if (editing && loading) {
    return (
      <div className="card">Loading {String(config?.singular || 'record').toLowerCase()}...</div>
    )
  }

  if (editing && !record) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-8">
        <PageHeader
          title={`${config.singular || 'Record'} not found`}
          description="It may have been removed or the link may be incorrect."
          action={
            <Link
              to={basePath}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to {String(config.plural || 'records').toLowerCase()}
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <PageHeader
        title={
          editing
            ? `Edit ${config.singular || 'Record'}`
            : config.addLabel || `Add ${config.singular || 'Record'}`
        }
        description={
          editing
            ? `Update ${getRecordName(config, record)} and save the latest information.`
            : config.description ||
              `Enter the details for this ${String(config.singular || 'record').toLowerCase()}.`
        }
        action={
          <Link
            to={basePath}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">
              Back to {String(config.plural || 'records').toLowerCase()}
            </span>
            <span className="sm:hidden">Back</span>
          </Link>
        }
      />

      <form onSubmit={save} className="space-y-5">
        {failedLookups.length > 0 && (
          <div
            className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span>
              Reference options for {failedLookups.join(', ')} could not be loaded. Existing saved
              values are preserved.
            </span>
            <button
              type="button"
              className="shrink-0 font-semibold text-amber-900 underline"
              onClick={retryLookups}
            >
              Retry
            </button>
          </div>
        )}
        {sections.map((section, sectionIndex) => (
          <section
            key={section.key || section.title || sectionIndex}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.06)]"
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white px-5 py-5 sm:px-7 lg:px-8">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                  <ClipboardPenLine size={21} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-800 sm:text-lg">{section.title}</h2>
                  {section.description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7 lg:px-8 lg:py-8">
              {section.fields.map(field => {
                const runtimeField = withLinkedOptions(
                  config,
                  field,
                  displayValues[field.name],
                  references
                )
                return (
                  <CrudField
                    key={field.name}
                    field={runtimeField}
                    value={displayValues[field.name]}
                    setValue={setValue}
                    onFile={handleFile}
                    reading={readingFiles.includes(field.name)}
                  />
                )
              })}
            </div>
          </section>
        ))}

        {!sections.length && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-700">
            No form sections have been configured for this module.
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,45,75,0.05)] sm:flex-row sm:justify-end sm:px-7 lg:px-8">
          <Link
            to={basePath}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            disabled={saving || readingFiles.length > 0 || !sections.length}
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {saving
              ? 'Saving…'
              : readingFiles.length
                ? 'Reading file…'
                : editing
                  ? 'Save changes'
                  : `Create ${config.singular || 'record'}`}
          </button>
        </div>
      </form>
      <CrudToast toast={toast} onClose={closeToast} />
    </div>
  )
}

function fileMatchesAccept(file, accept) {
  const rules = String(accept)
    .split(',')
    .map(rule => rule.trim().toLowerCase())
    .filter(Boolean)
  if (!rules.length) return true
  const type = String(file.type || '').toLowerCase()
  const name = String(file.name || '').toLowerCase()
  return rules.some(
    rule =>
      rule === '*/*' ||
      (rule.endsWith('/*') && type.startsWith(rule.slice(0, -1))) ||
      (rule.startsWith('.') && name.endsWith(rule)) ||
      rule === type
  )
}

function CrudField({ field, value, setValue, onFile, reading }) {
  const id = `crm-${field.name}`
  const full = field.full || ['textarea', 'file', 'image'].includes(field.type)
  const Icon = fieldIcon(field)
  const common = {
    id,
    name: field.name,
    required: field.required,
    readOnly: field.readOnly,
    disabled: field.disabled || field.readOnly,
    'aria-describedby': field.help ? `${id}-help` : undefined,
  }

  if (field.type === 'hidden') return <input type="hidden" name={field.name} value={value ?? ''} />

  if (field.type === 'checkbox') {
    return (
      <div className={full ? 'sm:col-span-2' : ''}>
        <label
          htmlFor={id}
          className={`relative flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 transition focus-within:ring-4 focus-within:ring-sky-100 ${value ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'} ${common.disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-sky-200'}`}
        >
          <input
            {...common}
            type="checkbox"
            checked={Boolean(value)}
            onChange={event => setValue(field.name, event.target.checked)}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-transparent transition peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100">
            <Check size={13} strokeWidth={3} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-rose-500"> *</span>}
            </span>
            {field.help && (
              <span id={`${id}-help`} className="mt-0.5 block text-xs leading-5 text-slate-500">
                {field.help}
              </span>
            )}
          </span>
        </label>
      </div>
    )
  }

  if (field.type === 'radio') {
    return (
      <fieldset className={full ? 'sm:col-span-2' : ''}>
        <legend className={labelClass}>
          {field.label}
          {field.required && <span className="text-rose-500"> *</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {getOptions(field).map(option => {
            const optionVal = String(optionValue(option))
            return (
              <label key={optionVal} className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name={field.name}
                  value={optionVal}
                  checked={String(value ?? '') === optionVal}
                  disabled={field.readOnly || field.disabled}
                  required={field.required}
                  onChange={event => setValue(field.name, event.target.value)}
                />
                <span className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 transition hover:border-sky-200 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100">
                  {optionLabel(option)}
                </span>
              </label>
            )
          })}
        </div>
        {field.help && (
          <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-slate-500">
            {field.help}
          </p>
        )}
      </fieldset>
    )
  }

  if (field.type === 'file' || field.type === 'image') {
    const hasValue = Boolean(fileUrl(value))
    const image = hasValue && isImageValue(value, field)
    return (
      <div className={full ? 'sm:col-span-2' : ''}>
        <span className={labelClass}>
          {field.label}
          {field.required && <span className="text-rose-500"> *</span>}
        </span>
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-4 sm:flex-row sm:items-center">
          {hasValue ? (
            image ? (
              <img
                className="h-20 w-24 shrink-0 rounded-xl border-2 border-white bg-white object-cover shadow-sm"
                src={fileUrl(value)}
                alt={`${field.label} preview`}
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-sky-600 shadow-sm">
                <Paperclip size={23} />
              </span>
            )
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-sky-600 shadow-sm">
              {field.type === 'image' ? <ImageIcon size={24} /> : <UploadCloud size={24} />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-700">
              {reading
                ? 'Reading file…'
                : hasValue
                  ? fileName(value, `Current ${field.label}`)
                  : field.placeholder || `Choose ${String(field.label || 'file').toLowerCase()}`}
            </p>
            <p id={`${id}-help`} className="mt-1 text-xs leading-5 text-slate-500">
              {field.help ||
                `${field.accept || (field.type === 'image' ? 'Image files' : 'Accepted files')} up to 2 MB. Saved with the backend record.`}
            </p>
            <label
              htmlFor={id}
              className={`mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-100 ${field.readOnly ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
            >
              <UploadCloud size={14} /> {hasValue ? 'Replace file' : 'Browse file'}
            </label>
          </div>
          {hasValue && !field.readOnly && (
            <button
              type="button"
              onClick={() => setValue(field.name, '')}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-rose-500 shadow-sm transition hover:bg-rose-50"
              aria-label={`Remove ${field.label}`}
            >
              <Trash2 size={15} />
            </button>
          )}
          <input
            id={id}
            className="sr-only"
            name={field.name}
            type="file"
            accept={field.accept || (field.type === 'image' ? 'image/*' : undefined)}
            required={field.required && !hasValue}
            disabled={field.readOnly || field.disabled || reading}
            onChange={event => {
              onFile(field, event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className={full ? 'sm:col-span-2' : ''} htmlFor={id}>
        <span className={labelClass}>
          {field.label}
          {field.required && <span className="text-rose-500"> *</span>}
        </span>
        <textarea
          {...common}
          value={value ?? ''}
          onChange={event => setValue(field.name, event.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 4}
          className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        {field.help && (
          <span id={`${id}-help`} className="mt-2 block text-xs leading-5 text-slate-500">
            {field.help}
          </span>
        )}
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <label className={full ? 'sm:col-span-2' : ''} htmlFor={id}>
        <span className={labelClass}>
          {field.label}
          {field.required && <span className="text-rose-500"> *</span>}
        </span>
        <span className="relative block">
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <FormSelect
            {...common}
            value={value ?? ''}
            onChange={event => setValue(field.name, event.target.value)}
            placeholder={
              field.placeholder || `Select ${String(field.label || 'option').toLowerCase()}`
            }
            triggerClassName={`${inputClass} pr-11 pl-11`}
          >
            <option value="">
              {field.placeholder || `Select ${String(field.label || 'option').toLowerCase()}`}
            </option>
            {getOptions(field).map(option => (
              <option
                key={String(optionValue(option))}
                value={optionValue(option)}
                disabled={typeof option === 'object' && option.disabled}
              >
                {optionLabel(option)}
              </option>
            ))}
          </FormSelect>
        </span>
        {field.help && (
          <span id={`${id}-help`} className="mt-2 block text-xs leading-5 text-slate-500">
            {field.help}
          </span>
        )}
      </label>
    )
  }

  if (field.type === 'date') {
    return (
      <label className={full ? 'sm:col-span-2' : ''} htmlFor={id}>
        <span className={labelClass}>
          {field.label}
          {field.required && <span className="text-rose-500"> *</span>}
        </span>
        <FormDatePicker
          {...common}
          value={value ?? ''}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder || `Select ${String(field.label || 'date').toLowerCase()}`}
          triggerClassName={`${inputClass} px-4`}
          onChange={event => setValue(field.name, event.target.value)}
        />
        {field.help && (
          <span id={`${id}-help`} className="mt-2 block text-xs leading-5 text-slate-500">
            {field.help}
          </span>
        )}
      </label>
    )
  }

  const type = [
    'text',
    'email',
    'tel',
    'number',
    'date',
    'time',
    'datetime-local',
    'url',
    'password',
  ].includes(field.type)
    ? field.type
    : 'text'
  return (
    <label className={full ? 'sm:col-span-2' : ''} htmlFor={id}>
      <span className={labelClass}>
        {field.label}
        {field.required && <span className="text-rose-500"> *</span>}
      </span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <input
          {...common}
          type={type}
          value={value ?? ''}
          onChange={event => setValue(field.name, event.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          autoComplete={field.autoComplete}
          list={field.suggestions?.length ? `${id}-options` : undefined}
          className={`${inputClass} pl-11 ${['date', 'time', 'datetime-local'].includes(type) ? '[color-scheme:light]' : ''}`}
        />
        {field.suggestions?.length > 0 && (
          <datalist id={`${id}-options`}>
            {field.suggestions.map(option => (
              <option key={String(optionValue(option))} value={optionValue(option)}>
                {optionLabel(option)}
              </option>
            ))}
          </datalist>
        )}
      </span>
      {field.help && (
        <span id={`${id}-help`} className="mt-2 block text-xs leading-5 text-slate-500">
          {field.help}
        </span>
      )}
    </label>
  )
}
