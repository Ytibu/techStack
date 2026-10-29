import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync, unlinkSync, rmSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { readCatalog } from '../docs/.vitepress/catalog.mjs'
import { scopeForPath, searchInCurrentScope } from '../docs/.vitepress/scopes.mjs'

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

test('默认知识体系与可选风格独立发现，普通章节不产生第二种风格', t => {
  const { root, write } = fixture(t)
  write('mysql/index.md', '---\ndescription: 索引与事务。\n---\n# MySQL 知识体系')
  write('mysql/01-basics/index.md', '# 基础篇')
  write('mysql/01-basics/01-overview.md', '# 概述')
  assert.equal(readCatalog(root)[0].styles.length, 0)
  write('mysql/scenarios/index.md', '---\nstyle: 业务型\n---\n# MySQL 业务')
  write('mysql/scenarios/01-orders.md', '# 订单一致性')
  let topic = readCatalog(root)[0]
  assert.equal(topic.link, '/mysql/')
  assert.equal(topic.description, '索引与事务。')
  assert.deepEqual(topic.items.map(item => item.text), ['MySQL 知识体系', '基础篇'])
  assert.equal(topic.styles[0].text, '业务型')
  assert.equal(topic.styles[0].link, '/mysql/scenarios/')
  assert.equal(topic.styles[0].items[1].link, '/mysql/scenarios/01-orders')
  write('mysql/scenarios/02-payments.md', '# 支付回调')
  topic = readCatalog(root)[0]
  assert.equal(topic.styles[0].items.at(-1).link, '/mysql/scenarios/02-payments')
  assert.equal(topic.items.length, 2)
})

test('任意技术栈可添加、改名与移除风格标记，不依赖 MySQL 特例', t => {
  const { root, write } = fixture(t)
  write('redis/index.md', '# Redis')
  write('redis/01-internals/index.md', '# 原理篇\n\nstyle: 正文不是元数据')
  write('redis/notes/index.md', '---\nstyle: "速查型"\n---\n# Redis 速查')
  let topic = readCatalog(root)[0]
  assert.deepEqual(topic.styles.map(style => style.text), ['速查型'])
  assert.equal(topic.items[1].text, '原理篇')
  write('redis/notes/index.md', '---\nstyle: 排障型\n---\n# Redis 排障')
  assert.equal(readCatalog(root)[0].styles[0].text, '排障型')
  unlinkSync(join(root, 'redis/notes/index.md'))
  topic = readCatalog(root)[0]
  assert.equal(topic.styles.length, 0)
  assert.equal(topic.items.length, 2)
})

test('路由按技术栈与风格定位，章节目录及相似前缀不会误匹配', t => {
  const { root, write } = fixture(t)
  write('mysql/index.md', '# MySQL 知识库')
  write('mysql/scenarios/index.md', '---\nstyle: 业务型\n---\n# MySQL 业务')
  write('redis/index.md', '# Redis')
  const topics = readCatalog(root)
  const standard = scopeForPath('/mysql/01-basics/02-sql', topics)
  assert.equal(standard.text, '知识体系型')
  assert.equal(standard.style, undefined)
  assert.deepEqual(standard.excluded, ['/mysql/scenarios/'])
  for (const path of ['/mysql/scenarios/', '/mysql/scenarios', '/mysql/scenarios/01-orders.html#intro']) {
    const scope = scopeForPath(path, topics)
    assert.equal(scope.text, '业务型')
    assert.equal(scope.base, '/mysql/scenarios/')
    assert.deepEqual(scope.excluded, [])
  }
  assert.equal(scopeForPath('/mysql/scenarios-extra/', topics).style, undefined)
  assert.equal(scopeForPath('/redis/', topics).topic.id, 'redis')
  assert.equal(scopeForPath('/', topics), null)
  assert.equal(scopeForPath('/unknown/', topics), null)
})

test('搜索隔离嵌套风格，首页可查全部，序列化函数不依赖模块闭包', t => {
  const previous = globalThis.document
  t.after(() => { if (previous === undefined) delete globalThis.document; else globalThis.document = previous })
  const business = { id: '/mysql/scenarios/06-transactions.html#section' }
  const knowledge = { id: '/mysql/01-basics/06-transactions.html#section' }
  const redis = { id: '/redis/01-distributed/01-persistence.html#section' }
  const results = [business, knowledge, redis]
  let context = null
  globalThis.document = { querySelector: () => context }
  const filter = new Function('return (' + searchInCurrentScope.toString() + ')')()
  assert.deepEqual(results.filter(filter), results)
  for (const [base, excluded, expected] of [
    ['/mysql/', ['/mysql/scenarios/'], [knowledge]],
    ['/mysql/scenarios/', [], [business]],
    ['/redis/', [], [redis]]
  ]) {
    context = { dataset: { searchScope: base, searchExcluded: JSON.stringify(excluded) } }
    assert.deepEqual(results.filter(filter), expected)
  }
  context = null
  assert.deepEqual(results.filter(filter), results)
  delete globalThis.document
  assert.deepEqual(results.filter(filter), results)
})
