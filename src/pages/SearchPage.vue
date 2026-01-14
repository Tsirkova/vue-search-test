<script setup lang="ts">
import { computed, ref } from 'vue'
import { NEWS } from '../mock/news'
import type { NewsCategory, NewsItem } from '../types/news'

const query = ref('')
const category = ref<NewsCategory | 'all'>('all')
const sort = ref<'date_desc' | 'date_asc'>('date_desc')

function includesInsensitive(haystack: string, needle: string) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase())
}

const visible = computed<NewsItem[]>(() => {
  const q = query.value.trim()

  const result = NEWS
    .filter((n) => {
      if (category.value !== 'all' && n.category !== category.value) return false
      if (!q) return true
      return (
        includesInsensitive(n.title, q) ||
        includesInsensitive(n.description, q)
      )
    })
    .slice() // чтобы не мутировать исходный массив при сортировке
    .sort((a, b) => {
      if (sort.value === 'date_asc') return a.date.localeCompare(b.date)
      return b.date.localeCompare(a.date) // date_desc
    })

  return result
})
</script>

<template lang="pug">
main
  h1 Новости

  form(@submit.prevent)
    div
      label(for="q") Поиск
      input#q(v-model="query" placeholder="Заголовок или описание")

    div
      label(for="cat") Категория
      select#cat(v-model="category")
        option(value="all") Все
        option(value="company") Компания
        option(value="tech") Технологии
        option(value="events") События

    div
      label(for="sort") Сортировка
      select#sort(v-model="sort")
        option(value="date_desc") Сначала новые
        option(value="date_asc") Сначала старые

  hr

  p Всего: {{ visible.length }}

  ul
    li(v-for="n in visible" :key="n.id")
      h3 {{ n.title }}
      p {{ n.description }}
      small {{ n.date }} · {{ n.category }}
</template>