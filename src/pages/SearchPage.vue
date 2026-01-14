<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { NewsCategory, NewsItem } from '../types/news'

type Sort = 'date_desc' | 'date_asc'

interface NewsResponse {
  items: NewsItem[]
  total: number
}

const query = ref('')
const category = ref<NewsCategory | 'all'>('all')
const sort = ref<Sort>('date_desc')

const pageSize = ref(5)
const page = ref(1)

const items = ref<NewsItem[]>([])
const total = ref(0)

const loading = ref(false)
const error = ref<string | null>(null)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value))
})

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)

async function load() {
  loading.value = true
  error.value = null

  try {
    const url = new URL('/api/news', window.location.origin)
    url.searchParams.set('q', query.value)
    url.searchParams.set('category', category.value)
    url.searchParams.set('sort', sort.value)
    url.searchParams.set('page', String(page.value))
    url.searchParams.set('pageSize', String(pageSize.value))

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = (await res.json()) as NewsResponse
    items.value = data.items
    total.value = data.total
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function prevPage() {
  page.value = Math.max(1, page.value - 1)
}
function nextPage() {
  page.value = Math.min(totalPages.value, page.value + 1)
}

watch([query, category, sort, pageSize], () => {
  page.value = 1
})

watch([query, category, sort, page, pageSize], () => {
  void load()
})

onMounted(() => {
  void load()
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

    div
      label(for="ps") На странице
      select#ps(v-model.number="pageSize")
        option(:value="5") 5
        option(:value="10") 10

  hr

  template(v-if="loading")
    p Загрузка...

  template(v-else-if="error")
    p Ошибка: {{ error }}
    button(type="button" @click="load") Повторить

  template(v-else)
    p Всего: {{ total }} (страница {{ page }} из {{ totalPages }})

    nav
      button(type="button" @click="prevPage" :disabled="!canPrev") Назад
      button(type="button" @click="nextPage" :disabled="!canNext") Вперёд

    p(v-if="items.length === 0") Ничего не найдено.

    ul(v-else)
      li(v-for="n in items" :key="n.id")
        h3 {{ n.title }}
        p {{ n.description }}
        small {{ n.date }} · {{ n.category }}
</template>