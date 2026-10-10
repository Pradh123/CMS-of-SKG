const DEFAULT_API_URL = 'http://localhost:4000/api/v1'
const TOKEN_KEY = 'skg-admin-api-token'
const runtimeEnv = import.meta.env || {}

export const API_BASE_URL = (runtimeEnv.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function getAccessToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAccessToken(token) {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token)
    else window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Browsers with blocked storage can still use the app until the next reload.
  }
}

function responseData(payload) {
  return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = true, signal, unwrap = true } = options
  const token = getAccessToken()
  const requestHeaders = { Accept: 'application/json', ...headers }
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  if (body !== undefined && !isFormData) requestHeaders['Content-Type'] = 'application/json'
  if (auth && token) requestHeaders.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined || isFormData ? body : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      'Backend se connection nahi ho paaya. Server running hai ya nahi check karein.',
      {
        code: 'NETWORK_ERROR',
        details: error?.message,
      }
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (!response.ok) {
    const errorPayload = payload?.error || payload
    if (response.status === 401 && auth && getAccessToken() === token) {
      setAccessToken('')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skg-admin:unauthorized'))
      }
    }
    throw new ApiError(errorPayload?.message || `Request failed with status ${response.status}`, {
      status: response.status,
      code: errorPayload?.code || 'REQUEST_FAILED',
      details: errorPayload?.details,
    })
  }

  return unwrap ? responseData(payload) : payload
}

export function extractSessionToken(payload) {
  if (!payload || typeof payload !== 'object') return ''
  return (
    payload.accessToken ||
    payload.token ||
    payload.tokens?.accessToken ||
    payload.session?.accessToken ||
    payload.session?.token ||
    payload.data?.accessToken ||
    payload.data?.token ||
    ''
  )
}

export const collectionResources = {
  vehicles: 'vehicles',
  drivers: 'drivers',
  parties: 'parties',
  tripsRegular: 'trips-regular',
  tripsPickupDrop: 'trips-pickup-drop',
  vendors: 'vendors',
  fuel: 'fuel',
  issues: 'issues',
  invoices: 'invoices',
  branches: 'branches',
  cities: 'cities',
  leads: 'leads',
  'area-seo': 'area-seo',
  'route-seo': 'route-seo',
  blog: 'blogs',
  blogs: 'blogs',
  'chatgpt-prompts': 'chatgpt-prompts',
}

export function resourceForKey(key) {
  const resource = collectionResources[key]
  if (!resource) throw new ApiError(`Unknown API collection: ${key}`, { code: 'UNKNOWN_RESOURCE' })
  return resource
}

export function asRecordList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.results)) return value.results
  return []
}

const LIST_PAGE_SIZE = 100

async function listAllPages(path) {
  const records = []
  let page = 1
  let lastPage = 1

  do {
    const separator = path.includes('?') ? '&' : '?'
    const payload = await apiRequest(`${path}${separator}page=${page}&limit=${LIST_PAGE_SIZE}`, {
      unwrap: false,
    })
    const batch = asRecordList(responseData(payload))
    records.push(...batch)

    const reportedPages = Number(payload?.meta?.pages)
    lastPage =
      Number.isInteger(reportedPages) && reportedPages >= page
        ? reportedPages
        : batch.length === LIST_PAGE_SIZE
          ? page + 1
          : page
    page += 1
  } while (page <= lastPage)

  return records
}

export const healthApi = {
  get: () => apiRequest('/health', { auth: false }),
}

export const leadsApi = {
  list: () => listAllPages('/leads'),
  get: id => apiRequest(`/leads/${id}`),
  updateStatus: (id, status) =>
    apiRequest(`/leads/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: id => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
}

export const authApi = {
  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', auth: false, body: { email, password } }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  forgotPassword: email =>
    apiRequest('/auth/forgot-password', { method: 'POST', auth: false, body: { email } }),
  resetPassword: data =>
    apiRequest('/auth/reset-password', { method: 'POST', auth: false, body: data }),
  changePassword: data => apiRequest('/auth/change-password', { method: 'POST', body: data }),
  impersonate: userId => apiRequest(`/auth/impersonate/${userId}`, { method: 'POST' }),
  stopImpersonating: () => apiRequest('/auth/stop-impersonating', { method: 'POST' }),
}

export const usersApi = {
  list: () => listAllPages('/users'),
  create: data => apiRequest('/users', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/users/${id}`, { method: 'PATCH', body: data }),
  remove: id => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  updatePermissions: (id, permissions) =>
    apiRequest(`/users/${id}/permissions`, { method: 'PUT', body: { permissions } }),
}

export const profileApi = {
  get: () => apiRequest('/profile'),
  update: data => apiRequest('/profile', { method: 'PATCH', body: data }),
}

const lookupResources = new Set(['vehicles', 'drivers', 'vendors', 'parties'])

export const lookupsApi = {
  list: resource => {
    if (!lookupResources.has(resource)) {
      throw new ApiError(`Unknown lookup resource: ${resource}`, { code: 'UNKNOWN_RESOURCE' })
    }
    return apiRequest(`/lookups/${resource}`).then(asRecordList)
  },
}

export const recordsApi = {
  list: key => listAllPages(`/${resourceForKey(key)}`),
  get: (key, id) => apiRequest(`/${resourceForKey(key)}/${id}`),
  create: (key, data) => apiRequest(`/${resourceForKey(key)}`, { method: 'POST', body: data }),
  update: (key, id, data) =>
    apiRequest(`/${resourceForKey(key)}/${id}`, { method: 'PATCH', body: data }),
  remove: (key, id) => apiRequest(`/${resourceForKey(key)}/${id}`, { method: 'DELETE' }),
}

export const settingsApi = {
  getInvoice: () => apiRequest('/settings/invoice'),
  saveInvoice: data => apiRequest('/settings/invoice', { method: 'PUT', body: data }),
  getPreferences: () => apiRequest('/settings/preferences'),
  savePreferences: data => apiRequest('/settings/preferences', { method: 'PUT', body: data }),
}

export const dashboardApi = {
  get: () => apiRequest('/dashboard'),
}
