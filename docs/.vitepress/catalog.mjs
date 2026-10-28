import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const docsRoot = fileURLToPath(new URL('../', import.meta.url))

const labels = { mysql: 'MySQL', redis: 'Redis', rabbitmq: 'RabbitMQ', springboot: 'Spring Boot' }
const preferred = Object.keys(labels)
const collator = new Intl.Collator('zh-CN', { numeric: true })

function title(path) {
  const source = readFileSync(path, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  return source.match(/^#\s+(.+)$/m)?.[1].trim() ?? path.split(/[\\/]/).at(-1).replace(/\.md$/, '')
}

function link(path, root) {
  const route = relative(root, path).replaceAll('\\', '/')
  return '/' + (route.endsWith('/index.md') ? route.slice(0, -8) : route.slice(0, -3))
}

function scan(directory, root) {
  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.') && entry.name !== 'public')
    .sort((a, b) => (a.name === 'index.md' ? -1 : b.name === 'index.md' ? 1 : collator.compare(a.name, b.name)))
    .flatMap(entry => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        const items = scan(path, root)
        if (!items.length) return []
        const index = join(path, 'index.md')
        return [{ text: existsSync(index) ? title(index) : entry.name, collapsed: false, items }]
      }
      return entry.name.endsWith('.md') ? [{ text: title(path), link: link(path, root) }] : []
    })
}

export function readCatalog(root = docsRoot) {
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'public')
    .sort((a, b) => {
      const rank = name => preferred.includes(name) ? preferred.indexOf(name) : preferred.length
      return rank(a.name) - rank(b.name) || collator.compare(a.name, b.name)
    })
    .flatMap(entry => {
      const items = scan(join(root, entry.name), root)
      if (!items.length) return []
      const firstLink = nodes => nodes.flatMap(node => node.link ? [node.link] : firstLink(node.items))[0]
      return [{ id: entry.name, text: labels[entry.name] ?? entry.name, link: firstLink(items), items }]
    })
}

// 只有目录或文档标题改变时才重启配置；正文编辑仍使用 VitePress 热更新。
export function watchCatalog() {
  return {
    name: 'knowledge-catalog',
    configureServer(server) {
      let previous = JSON.stringify(readCatalog())
      let timer
      const onChange = path => {
        const absolute = resolve(path)
        if (!absolute.startsWith(docsRoot) || !path.endsWith('.md')) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          const next = JSON.stringify(readCatalog())
          if (next === previous) return
          previous = next
          // 走 VitePress 的配置重建入口，连同本地搜索一起刷新。
          // 直接 server.restart() 只重启 Vite，会复用旧搜索索引。
          server.watcher.emit('change', fileURLToPath(new URL('./config.mjs', import.meta.url)))
        }, 150)
      }
      server.watcher.on('add', onChange).on('unlink', onChange).on('change', onChange)
      server.httpServer?.once('close', () => {
        clearTimeout(timer)
        server.watcher.off('add', onChange).off('unlink', onChange).off('change', onChange)
      })
    }
  }
}
