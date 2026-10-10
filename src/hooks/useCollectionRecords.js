import { useCallback, useEffect, useState } from 'react'
import { asRecordList, recordsApi } from '../services/apiClient.js'

const recordCache = new Map()
const listeners = new Map()
let cacheGeneration = 0
let loadSequence = 0
const collectionRevisions = new Map()
const latestLoads = new Map()

function copy(records) {
  if (!Array.isArray(records)) return []
  try {
    return typeof structuredClone === 'function'
      ? structuredClone(records)
      : JSON.parse(JSON.stringify(records))
  } catch {
    return [...records]
  }
}

function notify(key, records) {
  recordCache.set(key, records)
  listeners.get(key)?.forEach(listener => listener(records))
}

function collectionRevision(key) {
  return collectionRevisions.get(key) || 0
}

function notifyMutation(key, records) {
  collectionRevisions.set(key, collectionRevision(key) + 1)
  notify(key, records)
}

function recordId(record) {
  return record?.id ?? record?._id
}

function subscribe(key, listener) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(listener)
  return () => {
    listeners.get(key)?.delete(listener)
    if (!listeners.get(key)?.size) listeners.delete(key)
  }
}

export function readCachedRecords(key) {
  return recordCache.has(key) ? copy(recordCache.get(key)) : []
}

export function clearCollectionCache() {
  const activeKeys = [...listeners.keys()]
  cacheGeneration += 1
  recordCache.clear()
  collectionRevisions.clear()
  latestLoads.clear()
  activeKeys.forEach(key => listeners.get(key)?.forEach(listener => listener([])))
}

export async function loadCollectionRecords(key) {
  const requestGeneration = cacheGeneration
  const requestRevision = collectionRevision(key)
  const requestSequence = ++loadSequence
  latestLoads.set(key, requestSequence)
  const records = asRecordList(await recordsApi.list(key))
  if (requestGeneration !== cacheGeneration) return []
  if (
    requestRevision !== collectionRevision(key) ||
    latestLoads.get(key) !== requestSequence
  ) {
    return readCachedRecords(key)
  }
  notify(key, records)
  return records
}

export async function createCollectionRecord(key, values) {
  const created = await recordsApi.create(key, values)
  const record = created?.record || created
  notifyMutation(key, [record, ...readCachedRecords(key)])
  return record
}

export async function updateCollectionRecord(key, id, values) {
  const updated = await recordsApi.update(key, id, values)
  const record = updated?.record || updated
  const cached = readCachedRecords(key)
  const hasCachedRecord = cached.some(item => String(recordId(item)) === String(id))
  notifyMutation(
    key,
    hasCachedRecord
      ? cached.map(item => (String(recordId(item)) === String(id) ? record : item))
      : [record, ...cached]
  )
  return record
}

export async function deleteCollectionRecord(key, id) {
  await recordsApi.remove(key, id)
  notifyMutation(
    key,
    readCachedRecords(key).filter(item => String(recordId(item)) !== String(id))
  )
  return true
}

export default function useCollectionRecords(key) {
  const [records, setRecords] = useState(() => readCachedRecords(key))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!key) return []
    setLoading(true)
    try {
      const next = await loadCollectionRecords(key)
      setError(null)
      return next
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    setRecords(readCachedRecords(key))
    const unsubscribe = subscribe(key, setRecords)
    let active = true
    setLoading(true)
    loadCollectionRecords(key)
      .then(() => {
        if (active) setError(null)
      })
      .catch(requestError => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      unsubscribe()
    }
  }, [key])

  const createRecord = useCallback(
    async values => {
      try {
        const record = await createCollectionRecord(key, values)
        setError(null)
        return record
      } catch (requestError) {
        setError(requestError)
        throw requestError
      }
    },
    [key]
  )

  const updateRecord = useCallback(
    async (id, values) => {
      try {
        const record = await updateCollectionRecord(key, id, values)
        setError(null)
        return record
      } catch (requestError) {
        setError(requestError)
        throw requestError
      }
    },
    [key]
  )

  const deleteRecord = useCallback(
    async id => {
      try {
        await deleteCollectionRecord(key, id)
        setError(null)
        return true
      } catch (requestError) {
        setError(requestError)
        throw requestError
      }
    },
    [key]
  )

  return { records, loading, error, refresh, createRecord, updateRecord, deleteRecord }
}
