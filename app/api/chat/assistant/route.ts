import { NextRequest, NextResponse } from 'next/server'
import {
  appendAssistantMessages,
  clearAssistantHistory,
  getAssistantHistory,
} from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { checkRateLimit } from '@/lib/rate-limit'

type Locale = 'UZ' | 'RU' | 'EN'

const QUICK_REPLIES: Record<Locale, Array<{ id: string; label: string }>> = {
  UZ: [
    { id: 'coins', label: 'Tangalar qanday ishlaydi?' },
    { id: 'unlock', label: 'Kontakt qanday ochiladi?' },
    { id: 'safety', label: 'Xavfsizlik qoidalari' },
    { id: 'exchange', label: 'Skill almashish tartibi' },
    { id: 'profile', label: 'Profil va e‘lon sozlash' },
  ],
  RU: [
    { id: 'coins', label: 'Как работают монеты?' },
    { id: 'unlock', label: 'Как открыть контакт?' },
    { id: 'safety', label: 'Правила безопасности' },
    { id: 'exchange', label: 'Как обмениваться навыками?' },
    { id: 'profile', label: 'Настройка профиля' },
  ],
  EN: [
    { id: 'coins', label: 'How do coins work?' },
    { id: 'unlock', label: 'How to unlock a contact?' },
    { id: 'safety', label: 'Safety rules' },
    { id: 'exchange', label: 'How skill barter works' },
    { id: 'profile', label: 'Profile & offer setup' },
  ],
}

const RULE_ANSWERS: Record<Locale, Record<string, string>> = {
  UZ: {
    coins:
      'Swaply tangalari (◈) platformadagi ichki valyutadir:\n• Ro‘yxatdan o‘tganingizda +5 ta bepul tanga olasiz.\n• Har kuni topbardagi "+1 tanga" tugmasi orqali bepul kunlik bonus olishingiz mumkin.\n• Yakunlangan har bir barter almashuvi uchun +1 bonus tanga beriladi.\n• Hamyoningizni to‘ldirish narxi: 1 tanga = 1,000 UZS (katta paketlarda +40% gacha bonus bor).',
    unlock:
      'Kontakt ochish juda oson:\n1. O‘zingizga yoqqan taklif kartasidagi "Kontaktni ochish (1 ◈)" tugmasini bosing.\n2. Tasdiqlash oynasidan so‘ng 1 ta tanga yechiladi va foydalanuvchining Telegram, WhatsApp hamda telefon raqami ochiladi.\n3. Shundan so‘ng shu profil yonida "Chatni boshlash" tugmasi paydo bo‘lib, 1-on-1 shaxsiy chat ochishingiz mumkin!',
    safety:
      'Swaply xavfsizlik qoidalari:\n• Birinchi dars yoki uchrashuvni iloji boricha jamoat joyida yoki ochiq video qo‘ng‘iroqda o‘tkazing.\n• Begona insonlarga oldindan pul o‘tkazmang — Swaply faqat bilimga bilim (pulsiz barter) tamoyilida ishlaydi.\n• Shubhali yoki spam e‘lon ko‘rsangiz, kartadagi bayroqcha (🚩) orqali shikoyat yuboring.',
    exchange:
      'Skill almashish 3 qadamda amalga oshadi:\n1. "+ Taklif qo‘shish" orqali nima o‘rgata olishingiz va nima o‘rganmoqchi ekaningizni joylang.\n2. Boshqa a‘zolarga "Taklif" tugmasi bilan almashuv so‘rovi yuboring yoki kontaktini ochib bog‘laning.\n3. Almashuv yakunlangach "Almashuvlarim" bo‘limida yakunlang va bir-biringizga reyting/sharh qoldiring!',
    profile:
      'Profilni kuchaytirish uchun:\n• Topbardagi ismingiz ustiga bosib shaxsiy rasm, qisqacha bio va aniq @username kiriting.\n• E‘lon yaratishda kamida bitta faol aloqa vositasi (Telegram, telefon yoki WhatsApp) qo‘shing.\n• Yaxshi reyting va sharhlar ko‘proq hamkor jalb qiladi.',
    greeting:
      'Salom! Men Swaply Yordamchisiman 👋 Platforma, tangalar, kontakt ochish, xavfsizlik yoki ko‘nikma almashish bo‘yicha istalgan savolingizni bering!',
    fallback:
      'Savolingiz uchun rahmat! Swaply’da siz hech qanday pul to‘lamasdan o‘z bilimingizni boshqalarning tajribasiga almashtirishingiz mumkin. Pastdagi tezkor tugmalardan birini tanlang yoki "tangalar", "kontakt", "xavfsizlik", "profil" haqida so‘rang.',
  },
  RU: {
    coins:
      'Монеты Swaply (◈) — внутренняя валюта платформы:\n• При регистрации вы получаете +5 бесплатных монет.\n• Каждый день можно забирать +1 монету через кнопку ежедневного бонуса.\n• За каждый завершённый обмен навыками начисляется +1 бонусная монета.\n• Пополнение кошелька: 1 монета = 1,000 UZS (в крупных пакетах до +40% бонуса).',
    unlock:
      'Как открыть контакт:\n1. Нажмите «Открыть контакт (1 ◈)» на карточке предложения.\n2. После подтверждения спишется 1 монета и откроются Telegram, WhatsApp и телефон автора.\n3. Сразу после этого появится кнопка «Начать чат» для личной переписки 1-на-1!',
    safety:
      'Правила безопасности Swaply:\n• Первую встречу проводите в людном месте или по видеосвязи.\n• Не переводите деньги незнакомцам — Swaply работает по принципу чистого бартера знаний.\n• При обнаружении спама или мошенничества нажмите на значок флажка (🚩) для жалобы.',
    exchange:
      'Как проходит обмен навыками:\n1. Опубликуйте своё предложение через «+ Добавить обмен».\n2. Отправьте запрос на обмен или откройте контакт подходящего участника.\n3. После занятия завершите обмен в разделе «Мои обмены» и оставьте честный отзыв!',
    profile:
      'Советы по настройке профиля:\n• Нажмите на своё имя в шапке, чтобы загрузить фото, заполнить био и @username.\n• При создании объявления укажите удобный способ связи (Telegram, телефон или WhatsApp).\n• Высокий рейтинг помогает быстрее находить партнёров.',
    greeting:
      'Привет! Я Swaply Помощник 👋 Спрашивайте о монетах, открытии контактов, обмене навыками или безопасности!',
    fallback:
      'Спасибо за вопрос! В Swaply вы можете обмениваться навыками без денег. Выберите быстрый вопрос ниже или спросите о монетах, контактах, профиле или безопасности.',
  },
  EN: {
    coins:
      'Swaply Coins (◈) power contact unlocks:\n• You get +5 free coins when registering.\n• Claim +1 free coin every day using the Daily Bonus button in the header.\n• Earn +1 bonus coin whenever you complete a skill swap.\n• Top-up rate: 1 coin = 1,000 UZS (with up to +40% bonus coins on larger packs).',
    unlock:
      'How to unlock a contact:\n1. Click "Unlock contact (1 ◈)" on any offer card or profile.\n2. Confirm spending 1 coin to reveal the author’s Telegram, WhatsApp, and phone number.\n3. Once unlocked, a "Start Chat" button appears so you can message them 1-on-1 directly inside Swaply!',
    safety:
      'Swaply Safety Tips:\n• Meet in public spaces or start with an open video call for your first session.\n• Never send upfront payments — Swaply is strictly for money-free skill barter.\n• Use the flag icon (🚩) on any card or profile to report spam or suspicious behavior.',
    exchange:
      'How Skill Barter works:\n1. Post what you can teach and want to learn via "+ Add an offer".\n2. Send a Swap Proposal or unlock a member’s contact to schedule sessions.\n3. Mark completed swaps in "My Swaps" and leave a star rating & review!',
    profile:
      'Profile & Offer setup:\n• Click your name in the top bar to upload a photo, set a bio, and customize your @username.\n• Include at least one contact method (Telegram, Phone, or WhatsApp) when creating an offer.\n• Good reviews boost your visibility across the community.',
    greeting:
      'Hi there! I am Swaply Assistant 👋 Ask me anything about coins, unlocking contacts, skill swaps, profile setup, or safety!',
    fallback:
      'Thanks for asking! On Swaply, you trade skills without money. Tap one of the quick questions below or ask about coins, contacts, profile setup, or safety.',
  },
}

function matchRuleAnswer(text: string, locale: Locale): { reply: string; matched: boolean } {
  const q = text.toLowerCase().trim()
  const dict = RULE_ANSWERS[locale]

  if (/(tanga|coin|монет|balans|hamyon|кошел|wallet|narx|цена|price|bonus|бонус)/i.test(q)) {
    return { reply: dict.coins, matched: true }
  }
  if (/(kontakt|contact|контакт|ochish|открыт|unlock|chatni boshlash|start chat)/i.test(q)) {
    return { reply: dict.unlock, matched: true }
  }
  if (/(xavfsiz|safety|безопас|scam|firibgar|spam|спам|shikoyat|жалоб|report)/i.test(q)) {
    return { reply: dict.safety, matched: true }
  }
  if (/(almash|barter|swap|exchange|обмен|taklif|предлож|offer|qanday ishlaydi|как работа|how.*work)/i.test(q)) {
    return { reply: dict.exchange, matched: true }
  }
  if (/(profil|profile|профил|avatar|аватар|username|e‘lon|elon|sozlash|настро)/i.test(q)) {
    return { reply: dict.profile, matched: true }
  }
  if (/^(salom|assalom|hi|hello|hey|привет|здравств)/i.test(q)) {
    return { reply: dict.greeting, matched: true }
  }

  return { reply: dict.fallback, matched: false }
}

async function askGemini(question: string, locale: Locale): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const langLabel =
    locale === 'RU' ? 'Russian' : locale === 'EN' ? 'English' : 'Uzbek (Latin script)'

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are "Swaply Yordamchi", the helpful assistant for SWAPLY — a money-free skill barter platform in Uzbekistan where users trade skills (programming, languages, design, etc.), get 5 free coins on signup, claim +1 daily coin, spend 1 coin to unlock someone's contact and start 1-on-1 chat, and follow safety rules. Reply concisely (max 4 sentences) in ${langLabel}.\n\nUser question: ${question}`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return typeof reply === 'string' && reply.trim() ? reply.trim() : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Yordamchini ochish uchun tizimga kiring')
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const rawLocale = searchParams.get('locale')
    const locale: Locale = rawLocale === 'RU' || rawLocale === 'EN' ? rawLocale : 'UZ'

    const messages = getAssistantHistory(auth.user.id)
    return NextResponse.json({
      messages,
      quickReplies: QUICK_REPLIES[locale],
      greeting: RULE_ANSWERS[locale].greeting,
    })
  } catch (error) {
    console.error('Assistant GET error:', error)
    return NextResponse.json({ error: 'Yordamchi tarixini yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Yordamchiga yozish uchun tizimga kiring')
    if (auth.error) return auth.error

    const rl = checkRateLimit(`assistant:${auth.user.id}`, 10, 15_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Iltimos, ${rl.retryAfterSec} soniyadan keyin qayta yozing` },
        { status: 429 }
      )
    }

    const parsed = await parseJsonBody<{ message?: unknown; locale?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { message, locale: rawLocale } = parsed.data
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Savol matnini kiriting' }, { status: 400 })
    }

    const cleanMessage = message.trim().slice(0, 800)
    const locale: Locale = rawLocale === 'RU' || rawLocale === 'EN' ? rawLocale : 'UZ'

    const rule = matchRuleAnswer(cleanMessage, locale)
    let replyText = rule.reply
    let source: 'rule' | 'gemini' | 'fallback' = rule.matched ? 'rule' : 'fallback'

    if (!rule.matched) {
      const geminiReply = await askGemini(cleanMessage, locale)
      if (geminiReply) {
        replyText = geminiReply
        source = 'gemini'
      }
    }

    const saved = appendAssistantMessages(auth.user.id, cleanMessage, replyText, locale, source)
    return NextResponse.json({
      success: true,
      userMessage: saved.userMsg,
      assistantMessage: saved.assistantMsg,
      source,
    })
  } catch (error) {
    console.error('Assistant POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateRequest(request)
    if (auth.error) return auth.error
    clearAssistantHistory(auth.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Assistant DELETE error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
