import { http, HttpResponse } from 'msw'
import { NEWS } from './data'
import type { NewsCategory, NewsItem } from '../types/news'

function includesInsensitive(haystack: string, needle: string) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase())
}

export const handlers = [
  http.get('/api/news', ({ request }) => {
    const url = new URL(request.url)

    const q = (url.searchParams.get('q') ?? '').trim()
    const category = (url.searchParams.get('category') ?? 'all') as NewsCategory | 'all'
    const sort = (url.searchParams.get('sort') ?? 'date_desc') as 'date_desc' | 'date_asc'

    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '5') || 5)

    const filteredSorted = NEWS
      .filter((n) => {
        if (category !== 'all' && n.category !== category) return false
        if (!q) return true
        return includesInsensitive(n.title, q) || includesInsensitive(n.description, q)
      })
      .slice()
      .sort((a, b) => {
        if (sort === 'date_asc') return a.date.localeCompare(b.date)
        return b.date.localeCompare(a.date)
      })

    const total = filteredSorted.length
    const start = (page - 1) * pageSize
    const items: NewsItem[] = filteredSorted.slice(start, start + pageSize)

    return HttpResponse.json({ items, total })
  }),
]