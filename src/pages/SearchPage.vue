<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NEWS } from '../mock/news'
import type { NewsCategory, NewsItem } from '../types/news'

const query = ref('')
const category = ref<NewsCategory | 'all'>('all')
const sort = ref<'date_desc' | 'date_asc'>('date_desc')

const pageSize = ref(5)
const page = ref(1)

function includesInsensitive(haystack: string, needle: string) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase())
}

watch([query, category, sort, pageSize], () => {
  page.value = 1
})

const filteredSorted = computed<NewsItem[]>(() => {
  const q = query.value.trim()

  return NEWS
    .filter((n) => {
      if (category.value !== 'all' && n.category !== category.value) return false
      if (!q) return true
      return (
        includesInsensitive(n.title, q) ||
        includesInsensitive(n.description, q)
      )
    })
    .slice()
    .sort((a, b) => {
      if (sort.value === 'date_asc') return a.date.localeCompare(b.date)
      return b.date.localeCompare(a.date)
    })
})

const total = computed(() => filteredSorted.value.length)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value))
})

const visible = computed<NewsItem[]>(() => {
  const safePage = Math.min(Math.max(1, page.value), totalPages.value)
  const start = (safePage - 1) * pageSize.value
  return filteredSorted.value.slice(start, start + pageSize.value)
})

function prevPage() {
  page.value = Math.max(1, page.value - 1)
}
function nextPage() {
  page.value = Math.min(totalPages.value, page.value + 1)
}
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

    div
      label(for="ps") На странице
      select#ps(v-model.number="pageSize")
        option(:value="5") 5
        option(:value="10") 10

  hr

  p Всего: {{ total }} (страница {{ page }} из {{ totalPages }})

  nav
    button(type="button" @click="prevPage" :disabled="page <= 1") Назад
    button(type="button" @click="nextPage" :disabled="page >= totalPages") Вперёд

  ul
    li(v-for="n in visible" :key="n.id")
      h3 {{ n.title }}
      p {{ n.description }}
      small {{ n.date }} · {{ n.category }}
</template>