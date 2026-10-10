export function parseVideoUrl(value) {
  let url
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('Enter a valid video URL')
  }
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('Use a secure HTTPS video URL')
  const host = url.hostname.toLowerCase()
  if (
    [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtube-nocookie.com',
    ].includes(host)
  ) {
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id || '')) throw new Error('Enter a valid YouTube video link')
    return { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + id }
  }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = url.pathname.match(/(?:^\/|\/video\/)(\d+)$/)?.[1]
    if (!id) throw new Error('Enter a valid Vimeo video link')
    return { kind: 'iframe', src: 'https://player.vimeo.com/video/' + id }
  }
  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: 'video', src: url.href }
  throw new Error('Use a YouTube, Vimeo, MP4, WEBM or OGG video link')
}
export function videoMarkup(value, title = 'Video') {
  const video = parseVideoUrl(value)
  const escape = text =>
    String(text).replace(
      /[&<>"']/g,
      char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
    )
  return (
    '<div class="cms-video" contenteditable="false">' +
    (video.kind === 'iframe'
      ? '<iframe src="' +
        escape(video.src) +
        '" title="' +
        escape(title || 'Video') +
        '" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>'
      : '<video src="' +
        escape(video.src) +
        '" controls preload="metadata" aria-label="' +
        escape(title || 'Video') +
        '"></video>') +
    '</div><p><br></p>'
  )
}
