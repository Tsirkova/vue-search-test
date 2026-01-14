export type NewsCategory = 'company' | 'tech' | 'events'

export interface NewsItem {
  id: number
  title: string
  description: string
  category: NewsCategory
  date: string 
}