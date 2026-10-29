<script setup>
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'
import { libraryForPath, topicForPath, switchLibrary } from '../libraries.mjs'
const route = useRoute()
const library = computed(() => libraryForPath(route.path))
const sharedRedis = computed(() => topicForPath(route.path) === 'redis')
const label = computed(() => sharedRedis.value ? 'Redis' : library.value === 'knowledge' ? '知识体系型' : '业务型')
</script>

<template>
  <nav v-if="library" class="library-context" aria-label="知识库与技术栈">
    <div class="library-heading">
      <strong>{{ label }}知识库</strong>
      <a v-if="!sharedRedis" :href="withBase(switchLibrary(route.path, data))">切换到{{ library === 'knowledge' ? '业务型' : '知识体系型' }}</a>
    </div>
    <div class="library-topics">
      <a v-for="topic in data[library]" :key="topic.id" :href="withBase(topic.link)" :aria-current="topic.id === topicForPath(route.path) ? 'page' : undefined">{{ topic.text }}</a>
    </div>
    <small>搜索范围：{{ label }}知识库</small>
  </nav>
</template>

<style scoped>
.library-context { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--vp-c-divider); font-size: 14px; }
.library-heading, .library-topics { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 8px; }
.library-heading { justify-content: space-between; }
a { color: var(--vp-c-brand-1); }
a:hover { text-decoration: underline; }
a[aria-current] { font-weight: 700; }
small { color: var(--vp-c-text-2); }
</style>
