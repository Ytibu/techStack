<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../catalog.data.mjs'

const props = defineProps({ topic: String })
const topics = computed(() => props.topic ? data.filter(item => item.id === props.topic) : data)
const flatten = items => items.flatMap(item => item.link ? [item] : flatten(item.items))
</script>

<template>
  <template v-for="section in topics" :key="section.id">
    <h2 v-if="!topic">{{ section.text }}</h2>
    <ul>
      <li v-for="item in flatten(section.items).filter(item => !topic || item.link !== `/${topic}/`)" :key="item.link">
        <a :href="withBase(item.link)">{{ item.text }}</a>
      </li>
    </ul>
  </template>
</template>
