import type { NewsCategory, NewsItem } from '../types/news'

const categories = ['company', 'tech', 'events'] as const

const titlesByCategory: Record<NewsCategory, readonly string[]> = {
  company: [
    'Компания: планы на квартал',
    'Компания: итоги недели',
    'Компания: обновления процессов',
    'Компания: новые политики и регламенты',
    'Компания: изменения в команде',
    'Компания: запуск инициативы',
  ],
  tech: [
    'Технологии: практики Vue 3',
    'Технологии: TypeScript в проекте',
    'Технологии: качество кода и линтинг',
    'Технологии: тестирование компонентов',
    'Технологии: производительность интерфейса',
    'Технологии: архитектура и рефакторинг',
  ],
  events: [
    'События: анонс митапа',
    'События: запись вебинара',
    'События: внутренний хакатон',
    'События: демо-день команд',
    'События: воркшоп',
    'События: конференция и доклады',
  ],
}

const descriptionsByCategory: Record<NewsCategory, readonly string[]> = {
  company: [
    'Короткое обновление по ключевым задачам и владельцам.',
    'Что изменилось, зачем и как это повлияет на работу команды.',
    'Сводка решений, договорённостей и следующих шагов.',
    'Важные детали по срокам, рискам и ожидаемым результатам.',
  ],
  tech: [
    'Практические советы, примеры и типичные ошибки.',
    'Сравнение подходов и рекомендации по внедрению.',
    'Разбор улучшений, которые упрощают поддержку проекта.',
    'Набор ссылок на полезные материалы и внутренние гайды.',
  ],
  events: [
    'Когда и где встречаемся, формат и что подготовить заранее.',
    'Ссылка на материалы, таймкоды и дополнительные ресурсы.',
    'Правила участия, команды, дедлайны и критерии оценки.',
    'Темы докладов, расписание и как задать вопрос спикерам.',
  ],
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

export const NEWS: NewsItem[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1

  const category = categories[i % categories.length]! satisfies NewsCategory

  const titleVariants = titlesByCategory[category]
  const descVariants = descriptionsByCategory[category]

  const baseTitle = titleVariants[i % titleVariants.length]!
  const baseDescription = descVariants[i % descVariants.length]!

  const date = new Date('2026-01-14T00:00:00.000Z')
  date.setUTCDate(date.getUTCDate() - i)

  return {
    id,
    category,
    date: formatDate(date),
    title: `${baseTitle} #${id}`,
    description: `${baseDescription} (выпуск #${id}).`,
  }
})