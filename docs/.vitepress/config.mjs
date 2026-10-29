import { defineConfig } from 'vitepress'
import { readLibraries, watchCatalog } from './catalog.mjs'
import { searchInCurrentLibrary } from './libraries.mjs'

const libraries = readLibraries()
const topics = [...new Map([...libraries.business, ...libraries.knowledge].map(topic => [topic.id, topic])).values()]

export default defineConfig({
  lang: 'zh-CN',
  title: 'Java 后端知识库',
  description: 'Java 后端知识库：MySQL 双风格与统一的 Redis 复习内容',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { component: 'MySQLNav' },
      ...topics.filter(topic => topic.id !== 'mysql').map(topic => ({ text: topic.text, link: topic.link }))
    ],
    sidebar: Object.fromEntries(Object.entries(libraries).flatMap(([library, topics]) => topics.map(topic => [`${library === 'knowledge' ? '/knowledge' : ''}/${topic.id}/`, topic.items]))),
    outline: { level: [2, 3], label: '本页目录' },
    search: {
      provider: 'local',
      options: {
        disableQueryPersistence: true,
        miniSearch: { searchOptions: { filter: searchInCurrentLibrary } },
        locales: { root: { translations: {
        button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
        modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清除搜索',
          footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
      } } } }
    },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '技术目录',
    skipToContentLabel: '跳至正文',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    notFound: { title: '文档不存在', quote: '可以返回首页，或搜索其他知识点。', linkLabel: '返回首页' }
  },
  vite: { plugins: [watchCatalog()] }
})
