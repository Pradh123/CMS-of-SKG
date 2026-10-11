import slugify from './slugify.js'

export const WEBSITE_BASE_URL = (
  import.meta.env.VITE_WEBSITE_BASE_URL || 'https://skgtravels.com'
).replace(/\/+$/, '')

export function blogUrl(slug, title = '') {
  return `${WEBSITE_BASE_URL}/blogs/${slugify(slug || title)}`
}

export function routeUrl(slug, title = '') {
  return `${WEBSITE_BASE_URL}/${slugify(slug || title)}`
}
