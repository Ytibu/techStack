import DefaultTheme from 'vitepress/theme'
import KnowledgeCatalog from './KnowledgeCatalog.vue'
import LibraryContext from './LibraryContext.vue'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(LibraryContext) }),
  enhanceApp({ app }) { app.component('KnowledgeCatalog', KnowledgeCatalog) }
}
