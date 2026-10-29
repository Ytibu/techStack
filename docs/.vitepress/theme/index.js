import DefaultTheme from 'vitepress/theme'
import KnowledgeCatalog from './KnowledgeCatalog.vue'
import TopicContext from './TopicContext.vue'
import TopicNav from './TopicNav.vue'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(TopicContext) }),
  enhanceApp({ app }) {
    app.component('KnowledgeCatalog', KnowledgeCatalog)
    app.component('TopicNav', TopicNav)
  }
}
