<script setup>
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'
import { scopeForPath } from '../scopes.mjs'

const route = useRoute()
const scope = computed(() => scopeForPath(route.path, data))
</script>

<template>
  <nav v-if="scope" class="topic-context" aria-label="知识库与技术栈" :data-search-scope="scope.base" :data-search-excluded="JSON.stringify(scope.excluded)">
    <div class="topic-heading">
      <strong>{{ scope.topic.text }}知识库<template v-if="scope.style"> · {{ scope.text }}</template></strong>
    </div>
    <div v-if="scope.topic.styles.length" class="topic-styles" aria-label="阅读风格">
      <a :href="withBase(scope.topic.link)" :aria-current="!scope.style ? 'page' : undefined">知识体系型</a>
      <a v-for="style in scope.topic.styles" :key="style.id" :href="withBase(style.link)" :aria-current="style.id === scope.style?.id ? 'page' : undefined">{{ style.text }}</a>
    </div>
    <div class="topic-links">
      <a v-for="topic in data" :key="topic.id" :href="withBase(topic.link)" :aria-current="topic.id === scope.topic.id ? 'page' : undefined">{{ topic.text }}</a>
    </div>
    <small>搜索范围：{{ scope.topic.text }} · {{ scope.text }}</small>
  </nav>
</template>

<style scoped>
.topic-context { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--vp-c-divider); font-size: 14px; }
.topic-heading, .topic-styles, .topic-links { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 8px; }
a { color: var(--vp-c-brand-1); }
a:hover { text-decoration: underline; }
a[aria-current] { font-weight: 700; }
small { color: var(--vp-c-text-2); }
</style>
