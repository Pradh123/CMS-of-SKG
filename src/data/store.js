import { readCachedRecords, loadCollectionRecords } from '../hooks/useCollectionRecords.js'
import { recordsApi } from '../services/apiClient.js'

export function readRecords(key) {
  return readCachedRecords(key)
}

export const loadRecords = key => loadCollectionRecords(key)
export const createRecord = (key, record) => recordsApi.create(key, record)
export const updateRecord = (key, id, record) => recordsApi.update(key, id, record)
export const deleteRecord = (key, id) => recordsApi.remove(key, id)
