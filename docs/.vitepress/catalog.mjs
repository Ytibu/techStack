import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const docsRoot = fileURLToPath(new URL('../', import.meta.url))

const labels = { mysql: 'MySQL', redis: 'Redis', rabbitmq: 'RabbitMQ', springboot: 'Spring Boot' }
const preferred = Object.keys(labels)
const collator = new Intl.Collator('zh-CN', { numeric: true })

function metadata(path) {
  const source = readFileSync(path, 'utf8')
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? ''
  // 目录元数据仅使用单行文本，不解析正文中的同名字段。
  const field = name => header.match(new RegExp(`^${name}: *(.+)$`, 'm'))?.[1].trim().replace(/^(['"])(.*)\1$/, '$2')
  return {
    title: source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').match(/^#\s+(.+)$/m)?.[1].trim() ?? path.split(/[\\/]/).at(-1).replace(/\.md$/, ''),
    style: field('style'),
    description: field('description') ?? ''
  }
}

function link(path, root) {
  const route = relative(root, path).replaceAll('\\', '/')
  return '/' + (route.endsWith('/index.md') ? route.slice(0, -8) : route.slice(0, -3))
}

function scan(directory, root, excluded = []) {
  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.') && entry.name !== 'public' && !excluded.includes(entry.name))
    .sort((a, b) => (a.name === 'index.md' ? -1 : b.name === 'index.md' ? 1 : collator.compare(a.name, b.name)))
    .flatMap(entry => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        const items = scan(path, root)
        if (!items.length) return []
        const index = join(path, 'index.md')
        return [{ text: existsSync(index) ? metadata(index).title : entry.name, collapsed: false, items }]
      }
      return entry.name.endsWith('.md') ? [{ text: metadata(path).title, link: link(path, root) }] : []
    })
}

export function readCatalog(root = docsRoot) {
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'public')
    .sort((a, b) => {
      const rank = name => preferred.includes(name) ? preferred.indexOf(name) : preferred.length
      return rank(a.name) - rank(b.name) || collator.compare(a.name, b.name)
    })
    .flatMap(entry => {
      const directory = join(root, entry.name)
      const styles = readdirSync(directory, { withFileTypes: true })
        .filter(child => child.isDirectory() && !child.name.startsWith('.') && child.name !== 'public')
        .sort((a, b) => collator.compare(a.name, b.name))
        .flatMap(child => {
          const index = join(directory, child.name, 'index.md')
          if (!existsSync(index)) return []
          const info = metadata(index)
          if (!info.style) return []
          return [{ id: child.name, text: info.style, base: `/${entry.name}/${child.name}/`, link: link(index, root), items: scan(join(directory, child.name), root) }]
        })
      const items = scan(directory, root, styles.map(style => style.id))
      if (!items.length) return []
      const firstLink = nodes => nodes.flatMap(node => node.link ? [node.link] : firstLink(node.items))[0]
      const index = join(directory, 'index.md')
      return [{ id: entry.name, text: labels[entry.name] ?? entry.name, base: `/${entry.name}/`, link: firstLink(items), description: existsSync(index) ? metadata(index).description : '', items, styles }]
    })
}

// 目录、标题或风格元数据改变时才重启配置；正文编辑仍使用 VitePress 热更新。
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
