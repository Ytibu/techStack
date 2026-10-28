export function libraryForPath(path) {
  if (path === '/' || path === '/index.html') return null
  return path.startsWith('/knowledge/') ? 'knowledge' : 'business'
}

export function topicForPath(path) {
  const parts = path.split('/').filter(Boolean)
  return parts[0] === 'knowledge' ? parts[1] : parts[0] === 'business' ? undefined : parts[0]
}

export function switchLibrary(path, catalog) {
  const target = libraryForPath(path) === 'knowledge' ? 'business' : 'knowledge'
  return catalog[target].find(topic => topic.id === topicForPath(path))?.link ?? `/${target}/`
}

// 此函数会被 VitePress 序列化到客户端，必须保持自包含。
export function searchInCurrentLibrary(result) {
  if (typeof window === 'undefined') return true
  const path = window.location.pathname
  if (path === '/' || path === '/index.html') return true
  return path.startsWith('/knowledge/') === String(result.id).startsWith('/knowledge/')
}
