import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync, unlinkSync, rmSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { readCatalog, readLibraries } from '../docs/.vitepress/catalog.mjs'
import { libraryForPath, switchLibrary, searchInCurrentLibrary } from '../docs/.vitepress/libraries.mjs'

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

test('两套知识库分别发现内容，保持原业务地址并支持原资料的嵌套目录', t => {
  const { root, write } = fixture(t)
  write('business/index.md', '# 业务入口')
  write('mysql/index.md', '# 业务 MySQL')
  write('knowledge/index.md', '# 知识入口')
  write('knowledge/mysql/index.md', '# 体系 MySQL')
  write('knowledge/mysql/01-basics/index.md', '# 基础篇')
  write('knowledge/mysql/01-basics/01-overview.md', '# 1. 概述')
  let libraries = readLibraries(root)
  assert.deepEqual(libraries.business.map(item => item.id), ['mysql'])
  assert.equal(libraries.business[0].link, '/mysql/')
  assert.equal(libraries.knowledge[0].link, '/knowledge/mysql/')
  assert.equal(libraries.knowledge[0].items[1].text, '基础篇')
  write('knowledge/mysql/01-basics/02-sql.md', '# 2. SQL')
  libraries = readLibraries(root)
  assert.equal(libraries.knowledge[0].items[1].items[2].link, '/knowledge/mysql/01-basics/02-sql')
  assert.equal(libraries.business[0].items.length, 1)
  assert.equal(switchLibrary('/knowledge/mysql/01-basics/02-sql', libraries), '/mysql/')
  assert.equal(switchLibrary('/mysql/04-index-design', libraries), '/knowledge/mysql/')
  assert.equal(switchLibrary('/redis/', libraries), '/redis/')
})

test('搜索按当前知识库过滤，首页可查两套，同主题切换不依赖另一套正文', t => {
  const previous = globalThis.window
  t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous })
  const results = [{ id: '/mysql/04-index-design.html#section' }, { id: '/knowledge/mysql/02-advanced/02-indexes/04-use.html#section' }]
  globalThis.window = { location: { pathname: '/knowledge/mysql/' } }
  assert.deepEqual(results.filter(searchInCurrentLibrary), [results[1]])
  window.location.pathname = '/mysql/04-index-design'
  assert.deepEqual(results.filter(searchInCurrentLibrary), [results[0]])
  window.location.pathname = '/'
  assert.equal(results.filter(searchInCurrentLibrary).length, 2)
  assert.equal(libraryForPath('/'), null)
  assert.equal(libraryForPath('/knowledge/mysql/'), 'knowledge')
  assert.equal(libraryForPath('/business/'), 'business')
})

test('Redis 只收录一套正文，两边入口复用相同目录并可自动发现新增文章', t => {
  const { root, write } = fixture(t)
  write('mysql/index.md', '# MySQL')
  write('redis/index.md', '# Redis 知识库')
  write('redis/01-distributed/index.md', '# 分布式缓存')
  write('redis/01-distributed/01-persistence.md', '# 1. Redis 持久化')
  write('knowledge/mysql/index.md', '# MySQL 知识体系')
  write('knowledge/redis/index.md', '# Redis 原入口')
  let libraries = readLibraries(root)
  const redis = catalog => catalog.find(topic => topic.id === 'redis')
  assert.deepEqual(libraries.knowledge.map(topic => topic.id), ['mysql', 'redis'])
  assert.deepEqual(redis(libraries.knowledge), redis(libraries.business))
  assert.equal(redis(libraries.knowledge).link, '/redis/')
  assert.equal(switchLibrary('/knowledge/redis/', libraries), '/redis/')
  write('redis/01-distributed/02-replication.md', '# 2. Redis 主从')
  libraries = readLibraries(root)
  assert.equal(redis(libraries.knowledge).items[1].items.at(-1).link, '/redis/01-distributed/02-replication')
})

test('共享 Redis 可从两种风格搜索，Redis 页面只显示本专题结果', t => {
  const previous = globalThis.window
  t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous })
  const business = { id: '/mysql/06-transactions.html#section' }
  const knowledge = { id: '/knowledge/mysql/01-basics/06-transactions.html#section' }
  const redis = { id: '/redis/01-distributed/01-persistence.html#section' }
  const results = [business, knowledge, redis]
  globalThis.window = { location: { pathname: '/knowledge/mysql/' } }
  assert.deepEqual(results.filter(searchInCurrentLibrary), [knowledge, redis])
  window.location.pathname = '/mysql/'
  assert.deepEqual(results.filter(searchInCurrentLibrary), [business, redis])
  for (const path of ['/redis/', '/redis/04-internals/05-resp', '/knowledge/redis/']) {
    window.location.pathname = path
    assert.deepEqual(results.filter(searchInCurrentLibrary), [redis])
  }
  window.location.pathname = '/'
  assert.deepEqual(results.filter(searchInCurrentLibrary), results)
})
