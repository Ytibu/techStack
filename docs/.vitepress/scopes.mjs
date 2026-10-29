export function scopeForPath(path, topics) {
  const current = decodeURI(path).split(/[?#]/)[0].replace(/\.html$/, '')
  const topic = topics.find(item => current === item.base.slice(0, -1) || current.startsWith(item.base))
  if (!topic) return null
  const style = topic.styles.find(item => current === item.base.slice(0, -1) || current.startsWith(item.base))
  const entry = style ?? topic
  return {
    topic, style, base: entry.base, link: entry.link, items: entry.items,
    text: style?.text ?? '知识体系型',
    excluded: style ? [] : topic.styles.map(item => item.base)
  }
}

// VitePress 会序列化此函数；从当前页面的范围标记读取目录，保持函数自包含。
export function searchInCurrentScope(result) {
  if (typeof document === 'undefined') return true
  const context = document.querySelector('[data-search-scope]')
  if (!context) return true
  const id = String(result.id)
  return id.startsWith(context.dataset.searchScope) &&
    !JSON.parse(context.dataset.searchExcluded).some(base => id.startsWith(base))
}
