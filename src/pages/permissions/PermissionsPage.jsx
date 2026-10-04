import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, KeyRound, RotateCcw, Save, ShieldCheck, UserRound } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { FormSelect } from '../../components/common/FormControls.jsx'
import AppToast from '../../components/common/AppToast.jsx'
import useAuth from '../../hooks/useAuth.js'
import {
  normalizePermissions,
  permissionModules,
  permissionOperations,
  permissionsForRole,
} from '../../config/accessControl.js'

const operationClasses = {
  view: 'peer-checked:border-sky-600 peer-checked:bg-sky-600',
  create: 'peer-checked:border-emerald-600 peer-checked:bg-emerald-600',
  edit: 'peer-checked:border-amber-500 peer-checked:bg-amber-500',
  delete: 'peer-checked:border-rose-600 peer-checked:bg-rose-600',
}

function PermissionToggle({ checked, disabled, label, onChange, operation }) {
  return (
    <label
      className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}`}
    >
      <input
        className="peer sr-only"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.target.checked)}
      />
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-transparent transition peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100 peer-checked:text-white ${operationClasses[operation]}`}
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="text-xs font-semibold text-slate-600 md:sr-only">{label}</span>
    </label>
  )
}

export default function PermissionsPage() {
  const { users, saveUserPermissions } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const manageableUsers = useMemo(() => users.filter(user => user.role !== 'Super Admin'), [users])
  const requestedId = searchParams.get('user')
  const [selectedId, setSelectedId] = useState(() => requestedId || manageableUsers[0]?.id || '')
  const selectedUser = manageableUsers.find(user => String(user.id) === String(selectedId))
  const [draft, setDraft] = useState(() => normalizePermissions(selectedUser))
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!selectedUser && manageableUsers[0]) setSelectedId(manageableUsers[0].id)
  }, [manageableUsers, selectedUser])

  useEffect(() => {
    setDraft(normalizePermissions(selectedUser))
    setDirty(false)
  }, [selectedUser?.id])

  const selectUser = id => {
    setSelectedId(id)
    setSearchParams(id ? { user: id } : {})
  }

  const togglePermission = (module, operation, enabled) => {
    setDraft(current => {
      const existing = current[module.id] || []
      let next = enabled
        ? [...new Set([...existing, operation, ...(operation === 'view' ? [] : ['view'])])]
        : existing.filter(item => item !== operation)
      if (operation === 'view' && !enabled) next = []
      return { ...current, [module.id]: module.operations.filter(item => next.includes(item)) }
    })
    setDirty(true)
  }

  const applyRoleDefaults = () => {
    if (!selectedUser) return
    setDraft(permissionsForRole(selectedUser.role))
    setDirty(true)
  }

  const save = () => {
    if (!selectedUser) return
    saveUserPermissions(selectedUser.id, draft)
    setDirty(false)
    setToast({
      type: 'success',
      title: 'Permissions updated',
      message: `${selectedUser.name}'s sidebar, dashboard, routes, and allowed actions are now updated.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] pb-8">
      <PageHeader
        title="User Permissions"
        description="Control which CRM modules each user can see and what actions they can perform."
        action={
          <Link
            to="/users"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
          >
            <UserRound size={17} /> User listing
          </Link>
        }
      />

      {manageableUsers.length ? (
        <>
          <section className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,45,75,0.05)] lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Choose user
              </label>
              <FormSelect
                value={selectedId}
                onChange={event => selectUser(event.target.value)}
                triggerClassName="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                aria-label="Choose user"
              >
                {manageableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role} · {user.email}
                  </option>
                ))}
              </FormSelect>
              {selectedUser && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-sky-50 px-3 py-1 font-bold text-sky-700">
                    {selectedUser.role}
                  </span>
                  <span>{selectedUser.branch || 'All branches'}</span>
                  {selectedUser.blocked && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 font-bold text-rose-700">
                      Blocked
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={applyRoleDefaults}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={16} /> Use {selectedUser?.role} defaults
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={save}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} /> Save permissions
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,75,0.05)]">
            <header className="flex items-start gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white">
                <ShieldCheck size={19} />
              </span>
              <div>
                <h2 className="font-bold text-slate-800">Module and operation access</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create, Edit, or Delete automatically requires View access. Removing View disables
                  every action for that module.
                </p>
              </div>
            </header>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                      CRM module
                    </th>
                    {permissionOperations.map(operation => (
                      <th
                        key={operation.id}
                        className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                      >
                        {operation.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionModules.map(module => (
                    <tr key={module.id} className="hover:bg-sky-50/30">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{module.label}</div>
                        <code className="mt-1 block text-[11px] text-slate-400">{module.id}</code>
                      </td>
                      {permissionOperations.map(operation => {
                        const supported = module.operations.includes(operation.id)
                        return (
                          <td key={operation.id} className="px-4 py-4 text-center">
                            <PermissionToggle
                              label={operation.label}
                              operation={operation.id}
                              disabled={!supported}
                              checked={
                                supported && Boolean(draft[module.id]?.includes(operation.id))
                              }
                              onChange={checked => togglePermission(module, operation.id, checked)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {permissionModules.map(module => (
                <article key={module.id} className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800">{module.label}</h3>
                    <code className="text-[11px] text-slate-400">{module.id}</code>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {permissionOperations.map(operation => (
                      <div
                        key={operation.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <PermissionToggle
                          label={operation.label}
                          operation={operation.id}
                          disabled={!module.operations.includes(operation.id)}
                          checked={Boolean(draft[module.id]?.includes(operation.id))}
                          onChange={checked => togglePermission(module, operation.id, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {permissionOperations.map(operation => (
              <article
                key={operation.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <KeyRound size={16} className="text-sky-600" />
                  {operation.label}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{operation.description}</p>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <UserRound className="mx-auto text-slate-300" size={34} />
          <h2 className="mt-4 font-bold text-slate-800">Add a user first</h2>
          <p className="mt-2 text-sm text-slate-500">
            Permissions can be configured after a non-Super Admin user is created.
          </p>
          <Link
            to="/users/create"
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white"
          >
            Add user
          </Link>
        </section>
      )}
      <AppToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
