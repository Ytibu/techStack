<script setup>
import { withBase } from 'vitepress'
defineProps({ items: Array })
const indexOf = item => item.items?.find(child => child.link?.endsWith('/'))
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.link ?? item.text">
      <a v-if="item.link" :href="withBase(item.link)">{{ item.text }}</a>
      <template v-else>
        <a v-if="indexOf(item)" :href="withBase(indexOf(item).link)">{{ item.text }}</a>
        <strong v-else>{{ item.text }}</strong>
        <CatalogTree :items="item.items.filter(child => child !== indexOf(item))" />
      </template>
    </li>
  </ul>
</template>
