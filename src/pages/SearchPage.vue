<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NewsCategory, NewsItem } from '../types/news'

type Sort = 'date_desc' | 'date_asc'

interface NewsResponse {
  items: NewsItem[]
  total: number
}

const router = useRouter()
const route = useRoute()

const query = ref('')
const debouncedQuery = ref('')
let debounceTimer: number | undefined

const category = ref<NewsCategory | 'all'>('all')
const sort = ref<Sort>('date_desc')

const pageSize = ref(5)
const page = ref(1)

const items = ref<NewsItem[]>([])
const total = ref(0)

const loading = ref(false)
const error = ref<string | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)

function parseIntParam(v: unknown, fallback: number) {
  const n = typeof v === 'string' ? Number(v) : Array.isArray(v) ? Number(v[0]) : NaN
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function parseStringParam(v: unknown, fallback: string) {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return fallback
}

function isNewsCategory(v: string): v is NewsCategory {
  return v === 'company' || v === 'tech' || v === 'events'
}
function isSort(v: string): v is Sort {
  return v === 'date_desc' || v === 'date_asc'
}

function applyRouteToState() {
  const q = parseStringParam(route.query.q, '')
  const catRaw = parseStringParam(route.query.category, 'all')
  const sortRaw = parseStringParam(route.query.sort, 'date_desc')

  query.value = q
  debouncedQuery.value = q

  category.value = catRaw === 'all' ? 'all' : isNewsCategory(catRaw) ? catRaw : 'all'
  sort.value = isSort(sortRaw) ? sortRaw : 'date_desc'

  page.value = parseIntParam(route.query.page, 1)
  pageSize.value = parseIntParam(route.query.pageSize, 5)
}

async function syncStateToRoute() {
  await router.replace({
    query: {
      q: debouncedQuery.value || undefined,
      category: category.value !== 'all' ? category.value : undefined,
      sort: sort.value !== 'date_desc' ? sort.value : undefined,
      page: page.value !== 1 ? String(page.value) : undefined,
      pageSize: pageSize.value !== 5 ? String(pageSize.value) : undefined,
    },
  })
}

watch(
  query,
  (newVal) => {
    if (debounceTimer) window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => {
      debouncedQuery.value = newVal
    }, 300)
  },
  { immediate: true },
)

async function load() {
  loading.value = true
  error.value = null

  try {
    const url = new URL('/api/news', window.location.origin)
    url.searchParams.set('q', debouncedQuery.value)
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

watch([debouncedQuery, category, sort, pageSize], () => {
  page.value = 1
})

watch([debouncedQuery, category, sort, page, pageSize], () => {
  void load()
  void syncStateToRoute()
})

watch(
  () => route.query,
  () => {
    applyRouteToState()
  },
)

onMounted(() => {
  applyRouteToState()
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