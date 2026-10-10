import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import PageHeader from '../layout/PageHeader.jsx'
import { FormSelect } from '../common/FormControls.jsx'
import useCrudRecords from '../../hooks/useCrudRecords.js'
import useAuth from '../../hooks/useAuth.js'
import {
  ConfirmDialog,
  EmptyIllustration,
  getFields,
  getOptions,
  getRecordName,
  inputClass,
  CrudToast,
  optionLabel,
  optionValue,
  searchableText,
  ValuePreview,
} from './crmShared.jsx'

const PAGE_SIZES = [8, 16, 24]

function cleanPath(path = '') {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function columnDescriptor(column, fields, record) {
  const field = fields.find(item => item.name === column.key) || {}
  const inferredStatus = /status|state/i.test(column.key) ? 'status' : undefined
  const specialType = ['file', 'image'].includes(column.format) ? column.format : field.type
  return {
    ...field,
    ...column,
    type: specialType,
    format: column.format || field.format || inferredStatus,
    record,
  }
}

export default function CrudListPage({ config }) {
  const {
    records: loadedRecords,
    loading,
    error,
    deleteRecord,
    updateRecord,
  } = useCrudRecords(config)
  const { hasPermission } = useAuth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(config?.defaultFilter || '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [deleting, setDeleting] = useState(null)
  const [resolving, setResolving] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [resolveBusy, setResolveBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  const records = useMemo(() => {
    if (config?.mapListRecord) return loadedRecords.map(config.mapListRecord)
    if (!config?.resolve) return loadedRecords
    const field = config.resolve.field || 'status'
    const fallback = config.resolve.defaultOpen || 'Open'
    return loadedRecords.map(record => ({
      ...record,
      [field]: record[field] || fallback,
    }))
  }, [config, loadedRecords])

  const fields = useMemo(() => getFields(config), [config])
  const columns = useMemo(() => {
    if (Array.isArray(config?.columns) && config.columns.length) return config.columns
    return fields
      .slice(0, 5)
      .map((field, index) => ({ key: field.name, label: field.label, primary: index === 0 }))
  }, [config, fields])

  const searchKeys = useMemo(() => {
    if (config?.searchable === false) return []
    if (Array.isArray(config?.searchable))
      return config.searchable
        .map(item => (typeof item === 'string' ? item : item.key || item.name))
        .filter(Boolean)
    if (typeof config?.searchable === 'string') return [config.searchable]
    return [...new Set([...columns.map(column => column.key), ...fields.map(field => field.name)])]
  }, [config, columns, fields])

  const filterField = useMemo(() => {
    if (config?.filterField) return config.filterField
    const candidates = fields.filter(field => ['select', 'radio'].includes(field.type))
    return candidates.find(field => /status|state/i.test(field.name)) || candidates[0] || null
  }, [config, fields])

  const filterOptions = useMemo(() => {
    if (!filterField) return []
    const configured = getOptions(filterField)
    if (configured.length) return configured
    return [
      ...new Set(
        records
          .map(record => record[filterField.name])
          .filter(value => value !== '' && value !== undefined && value !== null)
      ),
    ]
  }, [filterField, records])

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return records.filter(record => {
      const matchesFilter = !filter || String(record[filterField?.name] ?? '') === filter
      if (!matchesFilter) return false
      if (!needle || !searchKeys.length) return true
      return searchKeys.some(key => searchableText(record[key]).toLowerCase().includes(needle))
    })
  }, [records, filter, filterField, query, searchKeys])

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)
  const firstVisible = filteredRecords.length ? (page - 1) * pageSize + 1 : 0
  const lastVisible = Math.min(page * pageSize, filteredRecords.length)
  const basePath = cleanPath(config?.path)
  const canCreate = hasPermission(basePath, 'create')
  const canEdit = hasPermission(basePath, 'edit')
  const canDelete = hasPermission(basePath, 'delete')
  const canViewDetails = Boolean(config.view && hasPermission(basePath, 'view'))
  const resolveConfig = config?.resolve
  const canResolve = Boolean(resolveConfig) && canEdit
  const hasRowActions = canViewDetails || canEdit || canDelete || canResolve
  const resolveField = resolveConfig?.field || 'status'
  const resolvedValue = resolveConfig?.resolvedValue || 'Resolved'
  const openValues = resolveConfig?.openValues || ['Open', 'In Progress']
  const isOpenRecord = record =>
    openValues.includes(record?.[resolveField] || resolveConfig?.defaultOpen)
  const openRecords = canResolve ? records.filter(isOpenRecord) : []

  useEffect(() => {
    setFilter('')
  }, [config?.key])
  useEffect(() => setPage(1), [query, filter, pageSize, config?.key])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const applyResolvedStatus = useCallback(
    async record => {
      await updateRecord(record.id, { [resolveField]: resolvedValue })
    },
    [resolveField, resolvedValue, updateRecord]
  )

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteRecord(deleting.id)
      setDeleting(null)
      setToast({
        type: 'success',
        title: `${config?.singular || 'Record'} removed`,
        message: `The ${String(config?.singular || 'record').toLowerCase()} is no longer in this list.`,
      })
    } catch {
      setToast({
        type: 'error',
        message: 'We couldn’t remove this record. Please try again.',
      })
    } finally {
      setDeleteBusy(false)
    }
  }

  const confirmResolve = async () => {
    if (!resolving) return
    setResolveBusy(true)
    try {
      if (resolving === 'all') {
        const unresolved = records.filter(isOpenRecord)
        for (const record of unresolved) await applyResolvedStatus(record)
        setToast({
          type: 'success',
          title: 'Issues resolved',
          message:
            unresolved.length === 1
              ? '1 open issue is now marked resolved.'
              : `${unresolved.length} open issues are now marked resolved.`,
        })
      } else {
        await applyResolvedStatus(resolving)
        setToast({
          type: 'success',
          title: 'Issue resolved',
          message: `${getRecordName(config, resolving)} is now marked resolved.`,
        })
      }
      setResolving(null)
    } catch {
      setToast({
        type: 'error',
        message: 'We couldn’t resolve this issue. Please try again.',
      })
    } finally {
      setResolveBusy(false)
    }
  }

  if (!config?.key || !config?.path) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
        This page needs a valid CRM configuration with a key and path.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] pb-8">
      <PageHeader
        title={config.plural || 'Records'}
        description={
          config.description ||
          `Manage all ${String(config.plural || 'records').toLowerCase()} in one place.`
        }
        action={
          canCreate || (canResolve && openRecords.length) ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canResolve && openRecords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setResolving('all')}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <CheckCircle2 size={17} /> Resolve all open
                </button>
              )}
              {canCreate ? (
                <Link
                  to={`${basePath}/create`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-sky-100"
                >
                  <Plus size={17} /> {config.addLabel || `Add ${config.singular || 'Record'}`}
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />

      {error && (
        <div
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {error.message}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.06)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50/80 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200">
                <List size={19} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-800">
                  {config.plural || 'Saved records'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {loading ? 'Loading' : records.length} total{' '}
                  {records.length === 1
                    ? String(config.singular || 'record').toLowerCase()
                    : String(config.plural || 'records').toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {searchKeys.length > 0 && (
                <label className="relative block min-w-0 sm:w-72">
                  <span className="sr-only">Search {config.plural}</span>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    className={`${inputClass} pr-10 pl-11`}
                    placeholder={`Search ${String(config.plural || 'records').toLowerCase()}…`}
                    type="search"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
              )}
              {filterField && filterOptions.length > 0 && (
                <label className="relative block sm:w-52">
                  <span className="sr-only">Filter by {filterField.label}</span>
                  <Filter
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <FormSelect
                    value={filter}
                    onChange={event => setFilter(event.target.value)}
                    triggerClassName={`${inputClass} pr-9 pl-11`}
                    aria-label={`Filter by ${filterField.label}`}
                  >
                    <option value="">All {filterField.label || 'statuses'}</option>
                    {filterOptions.map(option => (
                      <option key={String(optionValue(option))} value={String(optionValue(option))}>
                        {optionLabel(option)}
                      </option>
                    ))}
                  </FormSelect>
                </label>
              )}
            </div>
          </div>
        </div>

        {visibleRecords.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    {columns.map(column => (
                      <th
                        key={column.key}
                        scope="col"
                        className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
                      >
                        {column.label}
                      </th>
                    ))}
                    {hasRowActions && (
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRecords.map(record => (
                    <tr key={record.id} className="group transition hover:bg-sky-50/35">
                      {columns.map(column => {
                        const descriptor = columnDescriptor(column, fields, record)
                        const content = (
                          <ValuePreview
                            value={record[column.key]}
                            descriptor={descriptor}
                            compact
                          />
                        )
                        return (
                          <td
                            key={column.key}
                            className="max-w-[280px] px-5 py-4 text-sm text-slate-600"
                          >
                            {column.primary ? (
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800">
                                  {canViewDetails ? (
                                    <Link
                                      className="transition hover:text-sky-700"
                                      to={`${basePath}/${record.id}`}
                                    >
                                      {content}
                                    </Link>
                                  ) : (
                                    content
                                  )}
                                </div>
                                {column.secondaryKey && (
                                  <div className="mt-1 truncate text-xs text-slate-400">
                                    {searchableText(record[column.secondaryKey]) || '—'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              content
                            )}
                          </td>
                        )
                      })}
                      {hasRowActions && (
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-1.5">
                            {canViewDetails && (
                              <Link
                                to={`${basePath}/${record.id}`}
                                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                title="View"
                                aria-label={`View ${getRecordName(config, record)}`}
                              >
                                <Eye size={16} />
                              </Link>
                            )}
                            {canEdit && (
                              <Link
                                to={`${basePath}/${record.id}/edit`}
                                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                title="Edit"
                                aria-label={`Edit ${getRecordName(config, record)}`}
                              >
                                <Pencil size={16} />
                              </Link>
                            )}
                            {canResolve && isOpenRecord(record) && (
                              <button
                                type="button"
                                onClick={() => setResolving(record)}
                                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                title="Resolve"
                                aria-label={`Resolve ${getRecordName(config, record)}`}
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setDeleting(record)}
                                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                title="Delete"
                                aria-label={`Delete ${getRecordName(config, record)}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {visibleRecords.map(record => (
                <article key={record.id} className="p-5">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {columns.map((column, index) => (
                      <div key={column.key} className={index === 0 ? 'col-span-2' : ''}>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          {column.label}
                        </p>
                        <div
                          className={`text-sm ${column.primary ? 'font-bold text-slate-800' : 'text-slate-600'}`}
                        >
                          <ValuePreview
                            value={record[column.key]}
                            descriptor={columnDescriptor(column, fields, record)}
                            compact
                          />
                        </div>
                        {column.secondaryKey && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {searchableText(record[column.secondaryKey]) || '—'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    {canViewDetails && (
                      <Link
                        to={`${basePath}/${record.id}`}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                      >
                        <Eye size={15} /> View
                      </Link>
                    )}
                    {canEdit && (
                      <Link
                        to={`${basePath}/${record.id}/edit`}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                      >
                        <Pencil size={15} /> Edit
                      </Link>
                    )}
                    {canResolve && isOpenRecord(record) && (
                      <button
                        type="button"
                        onClick={() => setResolving(record)}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-700"
                      >
                        <CheckCircle2 size={15} /> Resolve
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleting(record)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-100 text-rose-600"
                        aria-label={`Delete ${getRecordName(config, record)}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <EmptyIllustration />
            <h3 className="mt-4 text-base font-bold text-slate-800">
              {query || filter
                ? 'No matching records'
                : `No ${String(config.plural || 'records').toLowerCase()} yet`}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {query || filter
                ? 'Try changing your search or filter to see more results.'
                : `Add your first ${String(config.singular || 'record').toLowerCase()} to get started.`}
            </p>
            {query || filter ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setFilter('')
                }}
                className="mt-5 inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : canCreate ? (
              <Link
                to={`${basePath}/create`}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white"
              >
                <Plus size={16} /> {config.addLabel || `Add ${config.singular || 'Record'}`}
              </Link>
            ) : null}
          </div>
        )}

        <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-3 text-xs text-slate-500 sm:w-auto sm:justify-start">
            <span className="whitespace-nowrap">
              Showing{' '}
              <strong className="text-slate-700">
                {firstVisible}–{lastVisible}
              </strong>{' '}
              of <strong className="text-slate-700">{filteredRecords.length}</strong>
            </span>
            <div className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />
            <label className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
              <span>Rows per page</span>
              <FormSelect
                value={pageSize}
                onChange={event => setPageSize(Number(event.target.value))}
                className="!w-20 shrink-0"
                triggerClassName="h-9 w-full rounded-xl border border-slate-200 bg-white py-0 pr-9 pl-3 text-xs font-bold text-slate-700 shadow-sm outline-none transition hover:border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                menuMinWidth={80}
                aria-label="Rows per page"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size}>{size}</option>
                ))}
              </FormSelect>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(current => current - 1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="min-w-20 text-center text-xs font-semibold text-slate-600">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage(current => current + 1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>

      <ConfirmDialog
        open={Boolean(deleting)}
        recordName={getRecordName(config, deleting)}
        singular={String(config.singular || 'record').toLowerCase()}
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        open={Boolean(resolving)}
        tone="success"
        title={resolving === 'all' ? 'Resolve all open issues?' : 'Resolve this issue?'}
        message={
          resolving === 'all'
            ? `${openRecords.length} open ${openRecords.length === 1 ? 'issue' : 'issues'} will be marked resolved.`
            : `“${getRecordName(config, resolving)}” will be marked resolved.`
        }
        confirmLabel={resolving === 'all' ? 'Resolve all' : 'Resolve issue'}
        recordName={getRecordName(config, resolving)}
        busy={resolveBusy}
        onCancel={() => setResolving(null)}
        onConfirm={confirmResolve}
      />
      <CrudToast toast={toast} onClose={closeToast} />
    </div>
  )
}
