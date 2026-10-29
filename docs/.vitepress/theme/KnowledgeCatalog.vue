<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'
import CatalogTree from './CatalogTree.vue'

const props = defineProps({ topic: String, section: String, library: { type: String, default: 'business' } })
const topics = computed(() => props.topic ? data[props.library].filter(item => item.id === props.topic) : data[props.library])
function items(section) {
  const base = section.link.endsWith('/') ? section.link : `${props.library === 'knowledge' ? '/knowledge' : ''}/${section.id}/`
  if (!props.section) return section.items.filter(item => item.link !== base)
  const find = nodes => {
    for (const node of nodes) {
      if (!node.items) continue
      if (node.items.some(item => item.link === `${base}${props.section}/`)) return node.items.filter(item => item.link !== `${base}${props.section}/`)
      const nested = find(node.items)
      if (nested) return nested
    }
  }
  return find(section.items) ?? []
}
</script>

<template>
  <template v-for="section in topics" :key="section.id">
    <h2 v-if="!topic">{{ section.text }}</h2>
    <p v-if="!topic"><a :href="withBase(section.link)">进入 {{ section.text }}</a></p>
    <CatalogTree v-else :items="items(section)" />
  </template>
</template>
