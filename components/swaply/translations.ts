import type { Locale } from './types'

export const copy: Record<Locale, {
  skillBarter: string
  offers: string
  howItWorks: string
  wallet: string
  coinLabel: string
  dailyBonus: string
  claimed: string
  signIn: string
  language: string
  addOffer: string
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  search: string
  all: string
  categories: string[]
  dailyCta: string
  addCta: string
  members: string
  exchanges: string
  activeOffers: string
  availableNow: string
  listings: string
  teach: string
  learn: string
  contact: string
  contactUs: string
  verified: string
  noResults: string
}> = {
  UZ: {
    skillBarter: 'Skill Barter', offers: 'E’lonlar', howItWorks: 'Qanday ishlaydi', wallet: 'Hamyon', coinLabel: 'tanga', dailyBonus: 'Kunlik bonus', claimed: 'Olingan', signIn: 'Kirish', language: 'Tilni tanlang', addOffer: 'Taklif qo‘shish',
    heroEyebrow: 'Bilim — eng yaxshi valyuta', heroTitle: 'Skilllarni pulsiz almashtir', heroBody: 'O‘z bilimingizni boshqalarning tajribasiga almashtiring. Hech qanday pul yo‘q — faqat vaqt va mahorat barteri.',
    search: 'Qaysi skillni izlayapsiz?', all: 'Barchasi', categories: ['IT & Dasturlash', 'Ingliz tili / IELTS', 'UI/UX & 3D', 'Mobilografiya'], dailyCta: 'Kunlik tangani olish', addCta: 'Taklif qo‘shish',
    members: 'hamjamiyat a’zosi', exchanges: 'muvaffaqiyatli barter', activeOffers: 'faol taklif', availableNow: 'BUGUN FAOL', listings: 'Hamjamiyat takliflari', teach: 'QO‘LIMDAN KELADI', learn: 'MENGA KERAK', contact: 'Kontaktni ochish', contactUs: 'Biz bilan bog‘lanish', verified: 'Tasdiqlangan', noResults: 'Bu qidiruvga mos taklif topilmadi.',
  },
  RU: {
    skillBarter: 'Обмен навыками', offers: 'Предложения', howItWorks: 'Как это работает', wallet: 'Кошелёк', coinLabel: 'монет', dailyBonus: 'Ежедневный бонус', claimed: 'Получено', signIn: 'Войти', language: 'Выбрать язык', addOffer: 'Добавить обмен',
    heroEyebrow: 'Знания — лучшая валюта', heroTitle: 'Меняй навыки без денег', heroBody: 'Обменивайся знаниями и опытом. Никаких денег — только время и мастерство.',
    search: 'Какой навык ищете?', all: 'Все', categories: ['IT и разработка', 'Английский / IELTS', 'UI/UX и 3D', 'Мобильная съёмка'], dailyCta: 'Забрать монету дня', addCta: 'Добавить обмен',
    members: 'участников сообщества', exchanges: 'успешных обмена', activeOffers: 'активных предложений', availableNow: 'СЕГОДНЯ НА СВЯЗИ', listings: 'Предложения сообщества', teach: 'МОГУ НАУЧИТЬ', learn: 'ХОЧУ ИЗУЧИТЬ', contact: 'Открыть контакт', contactUs: 'Связаться с нами', verified: 'Проверен', noResults: 'По вашему запросу предложений не найдено.',
  },
  EN: {
    skillBarter: 'Skill barter', offers: 'Offers', howItWorks: 'How it works', wallet: 'Wallet', coinLabel: 'coins', dailyBonus: 'Daily bonus', claimed: 'Claimed', signIn: 'Sign in', language: 'Choose language', addOffer: 'Add an offer',
    heroEyebrow: 'Knowledge is the best currency', heroTitle: 'Trade skills, not money', heroBody: 'Exchange what you know for someone else’s experience. No money involved — just time and craft.',
    search: 'What skill are you looking for?', all: 'All skills', categories: ['IT & Development', 'English / IELTS', 'UI/UX & 3D', 'Mobile photography'], dailyCta: 'Claim daily coin', addCta: 'Add an offer',
    members: 'community members', exchanges: 'successful exchanges', activeOffers: 'active offers', availableNow: 'AVAILABLE TODAY', listings: 'Community offers', teach: 'I CAN TEACH', learn: 'I WANT TO LEARN', contact: 'Unlock contact', contactUs: 'Contact us', verified: 'Verified', noResults: 'No offers match your search.',
  },
}
