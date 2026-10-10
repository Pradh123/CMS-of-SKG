import { apiRequest } from './apiClient.js'
export const mediaApi = {
  list: (scope = '/gallery', page = 1, limit = 24, signal, search = '') =>
    apiRequest(
      '/media?scope=' +
        encodeURIComponent(scope) +
        '&page=' +
        page +
        '&limit=' +
        limit +
        '&search=' +
        encodeURIComponent(search),
      {
        signal,
      }
    ),
  url: id => apiRequest('/media/' + encodeURIComponent(id) + '/url'),
  remove: id => apiRequest('/media/' + encodeURIComponent(id), { method: 'DELETE' }),
  update: (id, metadata) =>
    apiRequest('/media/' + encodeURIComponent(id), { method: 'PATCH', body: metadata }),
  upload: (file, scope = '/gallery', metadata = {}) =>
    new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) return reject(new Error('Maximum file size is 2 MB'))
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Unable to read file'))
      reader.onload = () =>
        apiRequest('/media', {
          method: 'POST',
          body: { name: file.name, ...metadata, dataUrl: reader.result, scope },
        }).then(resolve, reject)
      reader.readAsDataURL(file)
    }),
}
