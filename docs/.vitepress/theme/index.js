import DefaultTheme from 'vitepress/theme'
import KnowledgeCatalog from './KnowledgeCatalog.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { app.component('KnowledgeCatalog', KnowledgeCatalog) }
}
