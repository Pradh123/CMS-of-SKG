import { STORAGE_PREFIX } from '../config/constants.js'
import { areaSEOData } from './areaSEOData.js'
import { blogData } from './blogData.js'
import { promptData } from './promptData.js'
import { routeSEOData } from './routeSEOData.js'

const defaults = { 'area-seo': areaSEOData, 'route-seo': routeSEOData, blog: blogData, 'chatgpt-prompts': promptData }
export function readRecords(key) {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key)
    return saved === null ? (defaults[key] || []) : JSON.parse(saved)
  } catch {
    return []
  }
}
export function writeRecords(key, records) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(records))
}
