export type Category = {
  id: string
  name: string
  // Translation keys for each locale
  uz: string
  ru: string
  en: string
}

// Centralized category definitions - used across all locales
export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Barchasi',
    uz: 'Barchasi',
    ru: 'Все',
    en: 'All skills',
  },
  {
    id: 'it',
    name: 'IT & Dasturlash',
    uz: 'IT & Dasturlash',
    ru: 'IT и разработка',
    en: 'IT & Development',
  },
  {
    id: 'english',
    name: 'Ingliz tili / IELTS',
    uz: 'Ingliz tili / IELTS',
    ru: 'Английский / IELTS',
    en: 'English / IELTS',
  },
  {
    id: 'uiux',
    name: 'UI/UX & 3D',
    uz: 'UI/UX & 3D',
    ru: 'UI/UX и 3D',
    en: 'UI/UX & 3D',
  },
  {
    id: 'mobile',
    name: 'Mobilografiya',
    uz: 'Mobilografiya',
    ru: 'Мобильная съёмка',
    en: 'Mobile photography',
  },
]