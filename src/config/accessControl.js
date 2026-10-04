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

export function normalizePermissions(user = {}) {
  if (
    user.permissions &&
    typeof user.permissions === 'object' &&
    !Array.isArray(user.permissions)
  ) {
    return Object.fromEntries(
      permissionModules.map(module => {
        const saved = Array.isArray(user.permissions[module.id]) ? user.permissions[module.id] : []
        return [module.id, saved.filter(operation => module.operations.includes(operation))]
      })
    )
  }

  if (Array.isArray(user.panels)) {
    return Object.fromEntries(
      permissionModules.map(module => [
        module.id,
        user.panels.includes(module.id) ? allOperations(module) : [],
      ])
    )
  }

  return permissionsForRole(user.role)
}

export function visiblePanels(permissions = {}) {
  return permissionModules
    .filter(module => permissions[module.id]?.includes('view'))
    .map(module => module.id)
}
