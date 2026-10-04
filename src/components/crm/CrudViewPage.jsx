import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react'
import PageHeader from '../layout/PageHeader.jsx'
import useCrudRecords from '../../hooks/useCrudRecords.js'
import useAuth from '../../hooks/useAuth.js'
import {
  formatPlainValue,
  getOptions,
  getRecordName,
  getSections,
  isBlank,
  optionLabel,
  optionValue,
  ValuePreview,
} from './crmShared.jsx'

function cleanPath(path = '') {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function descriptorFor(field, record) {
  let format = field.format
  if (!format && field.type === 'date') format = 'date'
  if (!format && field.type === 'datetime-local') format = 'datetime'
  if (!format && /status|state/i.test(field.name)) format = 'status'
  return { ...field, format, record }
}

function displayValue(field, value) {
  if (!['select', 'radio'].includes(field.type)) return value
  const selected = getOptions(field).find(option => String(optionValue(option)) === String(value))
  return selected === undefined ? value : optionLabel(selected)
}

function detailIcon(field) {
  const text = `${field.name || ''} ${field.label || ''}`.toLowerCase()
  if (field.type === 'email') return Mail
  if (field.type === 'tel' || /phone|mobile|contact/.test(text)) return Phone
  if (/address|location|city|state/.test(text)) return MapPin
  if (/name|driver|vendor|party|person/.test(text)) return UserRound
  return ClipboardList
}

export default function CrudViewPage({ config }) {
  const params = useParams()
  const id = params.id ?? params.recordId
  const { records } = useCrudRecords(config)
  const { hasPermission } = useAuth()
  const sections = useMemo(() => getSections(config), [config])
  const record = records.find(item => String(item.id) === String(id))
  const basePath = cleanPath(config?.path)
  const canEdit = hasPermission(basePath, 'edit')

  if (!config?.key || !config?.path) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
        This page needs a valid CRM configuration with a key and path.
      </div>
    )
  }

  if (!record) {
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

  const title = getRecordName(config, record)

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <PageHeader
        title={title}
        description={`${config.singular || 'Record'} details and saved information.`}
        action={
          <div className="flex flex-wrap gap-2">
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
            {canEdit && (
              <Link
                to={`${basePath}/${record.id}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105"
              >
                <Pencil size={16} /> Edit
              </Link>
            )}
          </div>
        }
      />

      <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-600 to-blue-700 p-5 text-white shadow-lg shadow-sky-100 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ClipboardList size={25} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-100">
                {config.singular || 'Record'}
              </p>
              <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">{title}</h2>
              <p className="mt-1 text-xs text-sky-100">Record ID: {record.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:min-w-80">
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
              <span className="flex items-center gap-2 text-sky-100">
                <CalendarPlus size={14} /> Created
              </span>
              <strong className="mt-1.5 block text-white">
                {formatPlainValue(record.createdAt, 'date')}
              </strong>
            </div>
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
              <span className="flex items-center gap-2 text-sky-100">
                <CalendarClock size={14} /> Updated
              </span>
              <strong className="mt-1.5 block text-white">
                {formatPlainValue(record.updatedAt || record.createdAt, 'date')}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {sections.map((section, sectionIndex) => (
          <section
            key={section.key || section.title || sectionIndex}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.06)]"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white px-5 py-4 sm:px-7">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700">
                <ClipboardList size={17} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                {section.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
                )}
              </div>
            </div>
            <dl className="grid sm:grid-cols-2">
              {section.fields
                .filter(field => field.type !== 'hidden')
                .map((field, index) => {
                  const FieldIcon = detailIcon(field)
                  const value =
                    field.type === 'password' && !isBlank(record[field.name])
                      ? '••••••••'
                      : displayValue(field, record[field.name])
                  const full = field.full || ['textarea', 'file', 'image'].includes(field.type)
                  return (
                    <div
                      key={field.name}
                      className={`min-w-0 border-slate-100 p-5 sm:p-6 ${full ? 'sm:col-span-2' : ''} ${index ? 'border-t' : ''} sm:border-t ${!full && index % 2 ? 'sm:border-l' : ''}`}
                    >
                      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        <FieldIcon size={14} /> {field.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium leading-6 text-slate-700">
                        <LinkedValue field={field} value={value} record={record} />
                      </dd>
                    </div>
                  )
                })}
            </dl>
          </section>
        ))}

        {!sections.length && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-700">
            No detail sections have been configured for this module.
          </div>
        )}
      </div>
    </div>
  )
}

function LinkedValue({ field, value, record }) {
  if (isBlank(value))
    return <ValuePreview value={value} descriptor={descriptorFor(field, record)} />
  if (field.type === 'email')
    return (
      <a href={`mailto:${value}`} className="break-all text-sky-700 hover:underline">
        <ValuePreview value={value} descriptor={descriptorFor(field, record)} />
      </a>
    )
  if (field.type === 'tel')
    return (
      <a href={`tel:${String(value).replace(/\s/g, '')}`} className="text-sky-700 hover:underline">
        <ValuePreview value={value} descriptor={descriptorFor(field, record)} />
      </a>
    )
  if (field.type === 'url')
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="break-all text-sky-700 hover:underline"
      >
        <ValuePreview value={value} descriptor={descriptorFor(field, record)} />
      </a>
    )
  return <ValuePreview value={value} descriptor={descriptorFor(field, record)} />
}
