import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync, unlinkSync, rmSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { readCatalog } from '../docs/.vitepress/catalog.mjs'

function fixture(t) {
  const workspace = resolve('.work')
  mkdirSync(workspace, { recursive: true })
  const root = mkdtempSync(join(workspace, 'catalog-test-'))
  t.after(() => {
    assert.ok(resolve(root).startsWith(workspace + sep))
    rmSync(root, { recursive: true, force: true })
  })
  return {
    root,
    write(path, content) {
      const target = join(root, path)
      mkdirSync(resolve(target, '..'), { recursive: true })
      writeFileSync(target, content)
    }
  }
}

test('新增、改标题与删除文档都能被目录发现，无需维护配置列表', t => {
  const { root, write } = fixture(t)
  write('mysql/index.md', '# MySQL 面试知识库')
  write('mysql/10-last.md', '# 后面的文章')
  write('mysql/2-first.md', '# 前面的文章')
  assert.deepEqual(readCatalog(root)[0].items.map(item => item.link), ['/mysql/', '/mysql/2-first', '/mysql/10-last'])

  write('mysql/3-added.md', '# 自动新增')
  assert.equal(readCatalog(root)[0].items[2].text, '自动新增')
  write('mysql/3-added.md', '# 标题已修改')
  assert.equal(readCatalog(root)[0].items[2].text, '标题已修改')
  unlinkSync(join(root, 'mysql/3-added.md'))
  assert.equal(readCatalog(root)[0].items.length, 3)
})

test('技术栈独立，支持新技术栈首篇入口及嵌套目录', t => {
  const { root, write } = fixture(t)
  write('redis/index.md', '# Redis')
  write('mysql/index.md', '# MySQL')
  write('mysql/locks/index.md', '# 锁专题')
  write('mysql/locks/01-record.md', '# 记录锁')
  write('elasticsearch/01-search.md', '# 搜索基础')
  const catalog = readCatalog(root)
  assert.deepEqual(catalog.map(item => item.id), ['mysql', 'redis', 'elasticsearch'])
  assert.equal(catalog[2].link, '/elasticsearch/01-search')
  assert.deepEqual(catalog[0].items[1], {
    text: '锁专题', collapsed: false,
    items: [
      { text: '锁专题', link: '/mysql/locks/' },
      { text: '记录锁', link: '/mysql/locks/01-record' }
    ]
  })
  assert.equal(catalog[1].items.length, 1)
})

test('正确处理 index 后缀文件、中文路径、frontmatter 与隐藏资源', t => {
  const { root, write } = fixture(t)
  write('mysql/myindex.md', '---\ntitle: 配置标题\n---\n# 真正标题')
  write('mysql/中文.md', '# 中文文档')
  write('mysql/.hidden.md', '# 隐藏文档')
  write('mysql/.draft/index.md', '# 草稿')
  write('public/manual.md', '# 资源文件')
  write('.vitepress/internal.md', '# 配置文件')
  const catalog = readCatalog(root)
  assert.equal(catalog.length, 1)
  assert.equal(catalog[0].items.length, 2)
  assert.deepEqual(catalog[0].items.find(item => item.link === '/mysql/myindex'), { text: '真正标题', link: '/mysql/myindex' })
  assert.ok(catalog[0].items.some(item => item.link === '/mysql/中文'))
})
