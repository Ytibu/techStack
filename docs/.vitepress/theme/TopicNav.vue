<script setup>
import { computed, inject } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'
import { scopeForPath } from '../scopes.mjs'

const props = defineProps({ topic: String, screenMenu: Boolean })
const route = useRoute()
const entry = computed(() => data.find(item => item.id === props.topic))
const scope = computed(() => scopeForPath(route.path, data))
const closeScreen = inject('close-screen', () => {})
</script>

<template>
  <div v-if="entry" class="topic-nav" :class="{ 'screen-menu': screenMenu }">
    <a :href="withBase(entry.link)" :aria-current="scope?.topic.id === topic && !scope.style ? 'page' : undefined" @click="closeScreen">{{ entry.text }}</a>
    <template v-if="entry.styles.length">
      <span>（</span>
      <template v-for="(style, index) in entry.styles" :key="style.id">
        <span v-if="index"> / </span>
        <a :href="withBase(style.link)" :aria-label="`${entry.text} ${style.text}`" :aria-current="scope?.topic.id === topic && scope.style?.id === style.id ? 'page' : undefined" @click="closeScreen">{{ style.text }}</a>
      </template>
      <span>）</span>
    </template>
  </div>
</template>

<style scoped>
.topic-nav { display: flex; align-items: center; padding: 0 12px; line-height: var(--vp-nav-height); font-size: 14px; font-weight: 500; color: var(--vp-c-text-1); white-space: nowrap; }
a { transition: color 0.25s; }
a:hover, a[aria-current] { color: var(--vp-c-brand-1); }
.screen-menu { padding: 12px 0 11px; line-height: 24px; border-bottom: 1px solid var(--vp-c-divider); }
</style>
