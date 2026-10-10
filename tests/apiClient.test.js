import assert from 'node:assert/strict'
import test from 'node:test'
import {
  API_BASE_URL,
  ApiError,
  apiRequest,
  asRecordList,
  authApi,
  collectionResources,
  dashboardApi,
  getAccessToken,
  lookupsApi,
  profileApi,
  recordsApi,
  resourceForKey,
  setAccessToken,
  settingsApi,
  usersApi,
} from '../src/services/apiClient.js'
import {
  clearCollectionCache,
  createCollectionRecord,
  deleteCollectionRecord,
  loadCollectionRecords,
  readCachedRecords,
  updateCollectionRecord,
} from '../src/hooks/useCollectionRecords.js'

function storageWindow() {
  const values = new Map()
  return {
    sessionStorage: {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    },
    dispatchEvent: () => true,
  }
}

test('maps every admin collection to an explicit API resource', () => {
  assert.equal(resourceForKey('tripsRegular'), 'trips-regular')
  assert.equal(resourceForKey('tripsPickupDrop'), 'trips-pickup-drop')
  assert.equal(resourceForKey('blog'), 'blogs')
  assert.equal(resourceForKey('leads'), 'leads')
  assert.equal(Object.keys(collectionResources).length >= 17, true)
  assert.throws(
    () => resourceForKey('not-allowed'),
    error => error.code === 'UNKNOWN_RESOURCE'
  )
})

test('normalizes supported list response shapes', () => {
  const rows = [{ id: 'one' }]
  assert.deepEqual(asRecordList(rows), rows)
  assert.deepEqual(asRecordList({ records: rows }), rows)
  assert.deepEqual(asRecordList({ items: rows }), rows)
  assert.deepEqual(asRecordList({ results: rows }), rows)
  assert.deepEqual(asRecordList({}), [])
})

test('stores the bearer token in session storage', () => {
  global.window = storageWindow()
  setAccessToken('test-token')
  assert.equal(getAccessToken(), 'test-token')
  setAccessToken('')
  assert.equal(getAccessToken(), '')
  delete global.window
})

test('unwraps successful API data and sends bearer authorization', async () => {
  global.window = storageWindow()
  setAccessToken('secret-token')
  const originalFetch = global.fetch
  global.fetch = async (url, options) => {
    assert.equal(url, `${API_BASE_URL}/health`)
    assert.equal(options.headers.Authorization, 'Bearer secret-token')
    return new Response(JSON.stringify({ data: { status: 'ok' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    assert.deepEqual(await apiRequest('/health'), { status: 'ok' })
  } finally {
    global.fetch = originalFetch
    delete global.window
  }
})

test('turns API and network failures into ApiError objects', async () => {
  const originalFetch = global.fetch
  global.fetch = async () =>
    new Response(JSON.stringify({ error: { code: 'INVALID', message: 'Invalid input' } }), {
      status: 422,
      headers: { 'content-type': 'application/json' },
    })
  await assert.rejects(
    () => apiRequest('/invalid', { auth: false }),
    error => error instanceof ApiError && error.status === 422 && error.code === 'INVALID'
  )

  global.fetch = async () => {
    throw new Error('offline')
  }
  await assert.rejects(
    () => apiRequest('/offline', { auth: false }),
    error => error instanceof ApiError && error.code === 'NETWORK_ERROR'
  )
  global.fetch = originalFetch
})

test('loads every backend page for locally paginated admin lists', async () => {
  const originalFetch = global.fetch
  const requestedUrls = []
  global.fetch = async url => {
    requestedUrls.push(url)
    const page = Number(new URL(url).searchParams.get('page'))
    const data = page === 1 ? [{ id: 'one' }] : [{ id: 'two' }]
    return new Response(JSON.stringify({ data, meta: { page, pages: 2, total: 2 } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    assert.deepEqual(await usersApi.list(), [{ id: 'one' }, { id: 'two' }])
    assert.deepEqual(await recordsApi.list('vehicles'), [{ id: 'one' }, { id: 'two' }])
    assert.deepEqual(requestedUrls, [
      `${API_BASE_URL}/users?page=1&limit=100`,
      `${API_BASE_URL}/users?page=2&limit=100`,
      `${API_BASE_URL}/vehicles?page=1&limit=100`,
      `${API_BASE_URL}/vehicles?page=2&limit=100`,
    ])
  } finally {
    global.fetch = originalFetch
  }
})

test('updates the signed-in account through the self-service profile route', async () => {
  const originalFetch = global.fetch
  global.fetch = async (url, options) => {
    assert.equal(url, `${API_BASE_URL}/profile`)
    assert.equal(options.method, 'PATCH')
    assert.deepEqual(JSON.parse(options.body), { name: 'Updated Admin' })
    return new Response(JSON.stringify({ data: { id: 'user-1', name: 'Updated Admin' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    assert.deepEqual(await profileApi.update({ name: 'Updated Admin' }), {
      id: 'user-1',
      name: 'Updated Admin',
    })
  } finally {
    global.fetch = originalFetch
  }
})

test('loads only supported CRM lookup resources', async () => {
  const originalFetch = global.fetch
  global.fetch = async url => {
    assert.equal(url, `${API_BASE_URL}/lookups/vehicles`)
    return new Response(JSON.stringify({ data: [{ registrationNumber: 'MH01AB1234' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    assert.deepEqual(await lookupsApi.list('vehicles'), [{ registrationNumber: 'MH01AB1234' }])
    assert.throws(
      () => lookupsApi.list('invoices'),
      error => error instanceof ApiError && error.code === 'UNKNOWN_RESOURCE'
    )
  } finally {
    global.fetch = originalFetch
  }
})

test('does not expose demo fallback records when the API cache is empty', () => {
  clearCollectionCache()
  assert.deepEqual(readCachedRecords('vehicles', [{ id: 'demo-vehicle' }]), [])
})

test('loads API records into the shared cache and clears them between sessions', async () => {
  clearCollectionCache()
  const originalFetch = global.fetch
  global.fetch = async () =>
    new Response(JSON.stringify({ data: [{ id: 'vehicle-1' }], meta: { pages: 1 } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

  try {
    assert.deepEqual(await loadCollectionRecords('vehicles'), [{ id: 'vehicle-1' }])
    assert.deepEqual(readCachedRecords('vehicles'), [{ id: 'vehicle-1' }])
    clearCollectionCache()
    assert.deepEqual(readCachedRecords('vehicles'), [])
  } finally {
    global.fetch = originalFetch
  }
})

test('does not let an old in-flight request repopulate cache after a session change', async () => {
  clearCollectionCache()
  const originalFetch = global.fetch
  let finishRequest
  global.fetch = () =>
    new Promise(resolve => {
      finishRequest = resolve
    })

  try {
    const pending = loadCollectionRecords('vehicles')
    await Promise.resolve()
    clearCollectionCache()
    finishRequest(
      new Response(JSON.stringify({ data: [{ id: 'old-session-record' }], meta: { pages: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    assert.deepEqual(await pending, [])
    assert.deepEqual(readCachedRecords('vehicles'), [])
  } finally {
    global.fetch = originalFetch
  }
})

test('keeps the newest list response when concurrent loads finish out of order', async () => {
  clearCollectionCache()
  const originalFetch = global.fetch
  const responses = []
  global.fetch = () =>
    new Promise(resolve => {
      responses.push(resolve)
    })

  try {
    const olderLoad = loadCollectionRecords('vehicles')
    await Promise.resolve()
    const newerLoad = loadCollectionRecords('vehicles')
    await Promise.resolve()

    responses[1](
      new Response(JSON.stringify({ data: [{ id: 'newer' }], meta: { pages: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    assert.deepEqual(await newerLoad, [{ id: 'newer' }])

    responses[0](
      new Response(JSON.stringify({ data: [{ id: 'older' }], meta: { pages: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    assert.deepEqual(await olderLoad, [{ id: 'newer' }])
    assert.deepEqual(readCachedRecords('vehicles'), [{ id: 'newer' }])
  } finally {
    global.fetch = originalFetch
  }
})

test('does not let an in-flight list overwrite successful collection mutations', async () => {
  clearCollectionCache()
  const originalFetch = global.fetch
  let finishStaleLoad
  global.fetch = (url, options) => {
    if (options.method === 'GET') {
      return new Promise(resolve => {
        finishStaleLoad = resolve
      })
    }
    if (options.method === 'POST') {
      return Promise.resolve(
        new Response(JSON.stringify({ data: { id: 'created', name: 'Created' } }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        })
      )
    }
    if (options.method === 'PATCH') {
      return Promise.resolve(
        new Response(JSON.stringify({ data: { id: 'created', name: 'Updated' } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    }
    return Promise.resolve(
      new Response(JSON.stringify({ data: { message: 'Deleted' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
  }

  try {
    const staleLoad = loadCollectionRecords('vehicles')
    await Promise.resolve()
    await createCollectionRecord('vehicles', { name: 'Created' })
    await updateCollectionRecord('vehicles', 'created', { name: 'Updated' })
    assert.deepEqual(readCachedRecords('vehicles'), [{ id: 'created', name: 'Updated' }])

    finishStaleLoad(
      new Response(JSON.stringify({ data: [{ id: 'stale', name: 'Stale' }], meta: { pages: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    assert.deepEqual(await staleLoad, [{ id: 'created', name: 'Updated' }])
    assert.deepEqual(readCachedRecords('vehicles'), [{ id: 'created', name: 'Updated' }])

    await deleteCollectionRecord('vehicles', 'created')
    assert.deepEqual(readCachedRecords('vehicles'), [])
  } finally {
    global.fetch = originalFetch
  }
})

test('clears the session token and emits an unauthorized event for authenticated 401s', async () => {
  const events = []
  global.window = storageWindow()
  global.window.dispatchEvent = event => events.push(event.type)
  setAccessToken('expired-token')
  const originalFetch = global.fetch
  const OriginalCustomEvent = global.CustomEvent
  global.CustomEvent = class CustomEvent {
    constructor(type) {
      this.type = type
    }
  }
  global.fetch = async () =>
    new Response(JSON.stringify({ error: { message: 'Session expired' } }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })

  try {
    await assert.rejects(
      () => apiRequest('/auth/me'),
      error => error.status === 401
    )
    assert.equal(getAccessToken(), '')
    assert.deepEqual(events, ['skg-admin:unauthorized'])
  } finally {
    global.fetch = originalFetch
    global.CustomEvent = OriginalCustomEvent
    delete global.window
  }
})

test('does not sign out a newer session when an old request later returns 401', async () => {
  const events = []
  global.window = storageWindow()
  global.window.dispatchEvent = event => events.push(event.type)
  setAccessToken('old-token')
  const originalFetch = global.fetch
  let finishRequest
  global.fetch = () =>
    new Promise(resolve => {
      finishRequest = resolve
    })

  try {
    const pending = apiRequest('/vehicles')
    await Promise.resolve()
    setAccessToken('new-token')
    finishRequest(
      new Response(JSON.stringify({ error: { message: 'Old session expired' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    )
    await assert.rejects(
      () => pending,
      error => error.status === 401
    )
    assert.equal(getAccessToken(), 'new-token')
    assert.deepEqual(events, [])
  } finally {
    global.fetch = originalFetch
    delete global.window
  }
})

test('uses the public reset-password endpoint without authorization', async () => {
  const originalFetch = global.fetch
  global.window = storageWindow()
  setAccessToken('should-not-be-sent')
  global.fetch = async (url, options) => {
    assert.equal(url, `${API_BASE_URL}/auth/reset-password`)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, undefined)
    assert.deepEqual(JSON.parse(options.body), {
      token: 'reset-token',
      newPassword: 'StrongPass1!',
    })
    return new Response(JSON.stringify({ data: { message: 'Password reset successfully' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    assert.deepEqual(
      await authApi.resetPassword({ token: 'reset-token', newPassword: 'StrongPass1!' }),
      { message: 'Password reset successfully' }
    )
  } finally {
    global.fetch = originalFetch
    delete global.window
  }
})

test('uses the backend contracts for settings and dashboard', async () => {
  const originalFetch = global.fetch
  const requests = []
  global.fetch = async (url, options) => {
    requests.push({ url, method: options.method, body: options.body })
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    await settingsApi.getInvoice()
    await settingsApi.saveInvoice({ bankName: 'SKG Bank' })
    await settingsApi.getPreferences()
    await settingsApi.savePreferences({ notifications: true })
    await dashboardApi.get()
    assert.deepEqual(
      requests.map(request => [request.url, request.method]),
      [
        [`${API_BASE_URL}/settings/invoice`, 'GET'],
        [`${API_BASE_URL}/settings/invoice`, 'PUT'],
        [`${API_BASE_URL}/settings/preferences`, 'GET'],
        [`${API_BASE_URL}/settings/preferences`, 'PUT'],
        [`${API_BASE_URL}/dashboard`, 'GET'],
      ]
    )
  } finally {
    global.fetch = originalFetch
  }
})
