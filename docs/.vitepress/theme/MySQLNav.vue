<script setup>
import { inject } from 'vue'
import { useRoute, withBase } from 'vitepress'

defineProps({ screenMenu: Boolean })
const route = useRoute()
const closeScreen = inject('close-screen', () => {})
</script>

<template>
  <div class="mysql-nav" :class="{ 'screen-menu': screenMenu }">
    <a :href="withBase('/knowledge/mysql/')" :aria-current="route.path.startsWith('/knowledge/mysql/') ? 'page' : undefined" @click="closeScreen">MySQL</a>
    <span>（</span>
    <a :href="withBase('/mysql/')" aria-label="MySQL 业务型" :aria-current="route.path.startsWith('/mysql/') ? 'page' : undefined" @click="closeScreen">业务型</a>
    <span>）</span>
  </div>
</template>

<style scoped>
.mysql-nav { display: flex; align-items: center; padding: 0 12px; line-height: var(--vp-nav-height); font-size: 14px; font-weight: 500; color: var(--vp-c-text-1); white-space: nowrap; }
a { transition: color 0.25s; }
a:hover, a[aria-current] { color: var(--vp-c-brand-1); }
.screen-menu { padding: 12px 0 11px; line-height: 24px; border-bottom: 1px solid var(--vp-c-divider); }
</style>
