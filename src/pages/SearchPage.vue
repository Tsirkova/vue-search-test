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
section.page
  header.page__header
    h2.page__title Новости

  form.filters(@submit.prevent)
    label.field
      span.field__label Поиск
      input.field__control(type="text" v-model="query" placeholder="Заголовок или описание")

    label.field
      span.field__label Категория
      select.field__control(v-model="category")
        option(value="all") Все
        option(value="company") Компания
        option(value="tech") Технологии
        option(value="events") События

    label.field
      span.field__label Сортировка
      select.field__control(v-model="sort")
        option(value="date_desc") Сначала новые
        option(value="date_asc") Сначала старые

    label.field
      span.field__label На странице
      select.field__control(v-model.number="pageSize")
        option(:value="5") 5
        option(:value="10") 10

  div.status
    template(v-if="loading")
      p.muted Загрузка...

    template(v-else-if="error")
      p.error Ошибка: {{ error }}
      button.btn(type="button" @click="load") Повторить

    template(v-else)
      div.toolbar
        p.muted
          | Всего: {{ total }} · страница {{ page }} / {{ totalPages }}
        nav.pager
          button.btn.btn--ghost(type="button" @click="prevPage" :disabled="!canPrev") Назад
          button.btn(type="button" @click="nextPage" :disabled="!canNext") Вперёд

      p.muted(v-if="items.length === 0") Ничего не найдено.

      ul.list(v-else)
        li.card(v-for="n in items" :key="n.id")
          div.card__top
            h3.card__title {{ n.title }}
            span.badge {{ n.category }}
          p.card__desc {{ n.description }}
          p.card__meta {{ n.date }}
</template>


<style scoped>
.page__header {
  margin-bottom: 16px;
}

.page__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 800;
}

.page__subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.filters {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.6fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}

@media (max-width: 820px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

.field {
  display: grid;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  color: var(--muted);
}

.field__control {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  color: var(--text);
  outline: none;
}

.field__control:focus {
  border-color: color-mix(in srgb, var(--primary) 55%, var(--border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
}

.status {
  margin-top: 14px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0 12px;
}

@media (max-width: 520px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

.pager {
  display: flex;
  gap: 8px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 12px;
  background: #fff;
}

.card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
}

.card__desc {
  margin: 0 0 8px;
  color: var(--text);
  line-height: 1.4;
}

.card__meta {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #e0e7ff;
  font-size: 12px;
  white-space: nowrap;
}

.muted {
  color: var(--muted);
  margin: 0;
}

.error {
  color: #b91c1c;
  margin: 0 0 10px;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.btn:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  color: var(--primary);
}

.btn--ghost:hover {
  background: color-mix(in srgb, var(--primary) 10%, transparent);
}
</style>