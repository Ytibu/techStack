<script setup>
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'
import { scopeForPath } from '../scopes.mjs'
import CatalogTree from './CatalogTree.vue'

const props = defineProps({ topic: String, section: String })
const route = useRoute()
const scope = computed(() => {
  const topic = data.find(item => item.id === props.topic)
  if (!topic) return null
  const current = scopeForPath(route.path, data)
  return current?.topic.id === props.topic ? current : scopeForPath(topic.link, data)
})
const items = computed(() => {
  if (!scope.value) return []
  const { base, items } = scope.value
  if (!props.section) return items.filter(item => item.link !== base)
  const find = nodes => {
    for (const node of nodes) {
      if (!node.items) continue
      if (node.items.some(item => item.link === `${base}${props.section}/`)) return node.items.filter(item => item.link !== `${base}${props.section}/`)
      const nested = find(node.items)
      if (nested) return nested
    }
  }
  return find(items) ?? []
})
</script>

<template>
  <table v-if="!topic">
    <thead><tr><th>专题</th><th>内容</th></tr></thead>
    <tbody>
      <tr v-for="entry in data" :key="entry.id">
        <td>
          <span class="topic-name">
            <a :href="withBase(entry.link)">{{ entry.text }}</a>
            <template v-if="entry.styles.length">（<template v-for="(style, index) in entry.styles" :key="style.id"><span v-if="index"> / </span><a :href="withBase(style.link)">{{ style.text }}</a></template>）</template>
          </span>
        </td>
        <td>{{ entry.description || '专题内容持续整理中。' }}</td>
      </tr>
    </tbody>
  </table>
  <CatalogTree v-else :items="items" />
</template>

<style scoped>
.topic-name { white-space: nowrap; }
</style>
