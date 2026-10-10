import { accessPanels } from './menu.js'

export const permissionOperations = [
  { id: 'view', label: 'View', description: 'See the module, dashboard data, and records.' },
  { id: 'create', label: 'Create', description: 'Add new records in this module.' },
  { id: 'edit', label: 'Edit', description: 'Update existing records and statuses.' },
  { id: 'delete', label: 'Delete', description: 'Permanently remove records.' },
]

const limitedOperations = {
  '/': ['view'],
  '/leads': ['view', 'edit'],
  '/cms/area-seo': ['view', 'create', 'edit'],
  '/masters/invoice-settings': ['view', 'edit'],
}

export const permissionModules = accessPanels.map(panel => ({
  id: panel.id,
  label: panel.label,
  operations: limitedOperations[panel.id] || permissionOperations.map(operation => operation.id),
}))

const allOperations = module => [...module.operations]

export function permissionsForRole(role = 'Admin') {
  if (role === 'Super Admin') {
    return Object.fromEntries(permissionModules.map(module => [module.id, allOperations(module)]))
  }

  if (role === 'Inquiry') {
    return {
      '/': ['view'],
      '/leads': ['view', 'edit'],
    }
  }

  return Object.fromEntries(permissionModules.map(module => [module.id, allOperations(module)]))
}

function asAccount(user) {
  return user && typeof user === 'object' && !Array.isArray(user) ? user : {}
}

export function normalizePermissions(user) {
  const account = asAccount(user)

  if (
    account.permissions &&
    typeof account.permissions === 'object' &&
    !Array.isArray(account.permissions)
  ) {
    return Object.fromEntries(
      permissionModules.map(module => {
        const saved = Array.isArray(account.permissions[module.id])
          ? account.permissions[module.id]
          : []
        return [module.id, saved.filter(operation => module.operations.includes(operation))]
      })
    )
  }

  if (Array.isArray(account.panels)) {
    return Object.fromEntries(
      permissionModules.map(module => [
        module.id,
        account.panels.includes(module.id) ? allOperations(module) : [],
      ])
    )
  }

  return permissionsForRole(account.role)
}

export function visiblePanels(permissions) {
  const access = permissions && typeof permissions === 'object' ? permissions : {}
  return permissionModules
    .filter(module => access[module.id]?.includes('view'))
    .map(module => module.id)
}
