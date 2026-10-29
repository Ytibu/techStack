export function libraryForPath(path) {
  if (path === '/' || path === '/index.html') return null
  return path.startsWith('/knowledge/') ? 'knowledge' : 'business'
}

export function topicForPath(path) {
  const parts = path.split('/').filter(Boolean)
  return parts[0] === 'knowledge' ? parts[1] : parts[0] === 'business' ? undefined : parts[0]
}

export function switchLibrary(path, catalog) {
  if (topicForPath(path) === 'redis') return '/redis/'
  const target = libraryForPath(path) === 'knowledge' ? 'business' : 'knowledge'
  return catalog[target].find(topic => topic.id === topicForPath(path))?.link ?? `/${target}/`
}

// 此函数会被 VitePress 序列化到客户端，必须保持自包含。
export function searchInCurrentLibrary(result) {
  if (typeof window === 'undefined') return true
  const path = window.location.pathname
  if (path === '/' || path === '/index.html') return true
  // Redis 正文只有一份：两种入口均可检索，进入 Redis 后仅搜索本专题。
  const redisPage = /^\/(?:knowledge\/)?redis(?:\/|\.html|$)/.test(path)
  const redisResult = /^\/redis(?:\/|\.html|$)/.test(String(result.id))
  if (redisPage) return redisResult
  if (redisResult) return true
  return path.startsWith('/knowledge/') === String(result.id).startsWith('/knowledge/')
}
