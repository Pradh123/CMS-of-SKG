import { STORAGE_PREFIX } from '../config/constants.js'
export function readRecords(key) { try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key) || '[]') } catch { return [] } }
export function writeRecords(key, records) { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(records)) }
