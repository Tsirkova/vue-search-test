import type { NewsCategory, NewsItem } from '../types/news'

export type Sort = 'date_desc' | 'date_asc'

export interface GetNewsParams {
  q: string
  category: NewsCategory | 'all'
  sort: Sort
  page: number
  pageSize: number
  signal?: AbortSignal
}

export interface NewsResponse {
  items: NewsItem[]
  total: number
}

export async function getNews(params: GetNewsParams): Promise<NewsResponse> {
  const url = new URL('/api/news', window.location.origin)
  url.searchParams.set('q', params.q)
  url.searchParams.set('category', params.category)
  url.searchParams.set('sort', params.sort)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('pageSize', String(params.pageSize))

  const res = await fetch(url.toString(), { signal: params.signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return (await res.json()) as NewsResponse
}