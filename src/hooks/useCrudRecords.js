import { useCallback, useEffect, useState } from 'react'
import { STORAGE_PREFIX } from '../config/constants.js'

const CHANGE_EVENT = 'skg-crud-records-change'

function copySeed(seed) {
  if (!Array.isArray(seed)) return []
  try {
    return typeof structuredClone === 'function'
      ? structuredClone(seed)
      : JSON.parse(JSON.stringify(seed))
  } catch {
    return [...seed]
  }
}

export function crudStorageKey(key) {
  return `${STORAGE_PREFIX}${key || 'records'}`
}

export function readCrudRecords(config) {
  const fallback = copySeed(config?.seed)
  if (typeof window === 'undefined' || !config?.key) return fallback

  try {
    const saved = window.localStorage.getItem(crudStorageKey(config.key))
    if (saved === null) return fallback
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function writeCrudRecords(key, records) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(crudStorageKey(key), JSON.stringify(records))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function useCrudRecords(config) {
  const key = config?.key
  const [records, setRecords] = useState(() => readCrudRecords(config))

  useEffect(() => {
    setRecords(readCrudRecords(config))
  }, [key]) // A module key change represents a different local collection.

  useEffect(() => {
    if (typeof window === 'undefined' || !key) return undefined

    const refresh = event => {
      if (event.type === 'storage') {
        if (event.key !== crudStorageKey(key)) return
      } else if (event.detail?.key !== key) return
      setRecords(readCrudRecords(config))
    }

    window.addEventListener('storage', refresh)
    window.addEventListener(CHANGE_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(CHANGE_EVENT, refresh)
    }
  }, [key])

  const commit = useCallback(
    next => {
      if (!key) throw new Error('The CRM config requires a storage key.')
      writeCrudRecords(key, next)
      setRecords(next)
      return next
    },
    [key]
  )

  const createRecord = useCallback(
    values => {
      const now = new Date().toISOString()
      const record = {
        ...values,
        id: values.id || makeId(),
        createdAt: values.createdAt || now,
        updatedAt: now,
      }
      commit([record, ...records])
      return record
    },
    [commit, records]
  )

  const updateRecord = useCallback(
    (id, values) => {
      let updated = null
      const now = new Date().toISOString()
      const next = records.map(record => {
        if (String(record.id) !== String(id)) return record
        updated = { ...record, ...values, id: record.id, updatedAt: now }
        return updated
      })
      if (!updated) return null
      commit(next)
      return updated
    },
    [commit, records]
  )

  const deleteRecord = useCallback(
    id => {
      const next = records.filter(record => String(record.id) !== String(id))
      if (next.length === records.length) return false
      commit(next)
      return true
    },
    [commit, records]
  )

  return {
    records,
    createRecord,
    updateRecord,
    deleteRecord,
    refresh: () => setRecords(readCrudRecords(config)),
  }
}
