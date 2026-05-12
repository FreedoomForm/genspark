// scripts/create-error-lessons.mjs
//
// Creates lessons for error messages from FM (Fiscal Module)
// Each error is converted into an educational lesson with:
// - Error description and explanation
// - Solution steps
// - Prevention tips
//
// ENV:
//   MISTRAL_API_KEY        - ключ Mistral (обязательно)
//   DATABASE_URL           - Neon Postgres
//   GITHUB_REPOSITORY      - owner/repo
//   SCREENSHOT_RELEASE_TAG - по умолчанию lume-screenshots
//   FORCE                  - 1 = переписать даже существующие

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const PIXTRAL_MODEL = process.env.PIXTRAL_MODEL || 'pixtral-12b-2409';
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.SCREENSHOT_RELEASE_TAG || 'lume-screenshots';
const SCREENSHOT_BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;
const FORCE = process.env.FORCE === '1';

// Error codes with Russian descriptions
const ERROR_LESSONS = [
  {
    order: 1001,
    code: 'ZREPORT_IS_ALREADY_CLOSED',
    ruText: 'Z-отчет уже закрыт',
    uzText: 'Z-hisobot allaqachon yopilgan',
    keywords: ['z-report', 'zreport', 'report', 'smena'],
    category: 'errors'
  },
  {
    order: 1002,
    code: 'DATETIME_IS_IN_THE_PAST',
    ruText: 'Дата и время в прошлом',
    uzText: 'Sana va vaqt o\'tmishda',
    keywords: ['datetime', 'time', 'date', 'settings'],
    category: 'errors'
  },
  {
    order: 1003,
    code: 'SEND_ALL_RECEIPTS_FIRST',
    ruText: 'В ФМ хранятся чеки более чем 2 дня, выполните синхронизацию файлов с сервером',
    uzText: 'FM da 2 kundan ortiq cheklar saqlanadi, fayllarni server bilan sinxronlashtiring',
    keywords: ['receipt', 'sync', 'fiscal', 'fm'],
    category: 'errors'
  },
  {
    order: 1004,
    code: 'CANNOT_CLOSE_EMPTY_ZREPORT',
    ruText: 'Нельзя закрыть пустой Z-отчет',
    uzText: 'Bo\'sh Z-hisobotni yopib bo\'lmaydi',
    keywords: ['z-report', 'zreport', 'close', 'smena'],
    category: 'errors'
  },
  {
    order: 1005,
    code: 'RECIPT_SEQ_MAX_VALUE_REACHED',
    ruText: 'Достигнут максимальный номер чека в ФМ. Следует заменить ФМ на новый.',
    uzText: 'FM da chek raqami maksimal qiymatga yetdi. FM ni yangisiga almashtirish kerak.',
    keywords: ['receipt', 'fiscal', 'fm', 'check'],
    category: 'errors'
  },
  {
    order: 1006,
    code: 'CASH_CARD_ACCUMULATOR_OVERFLOW',
    ruText: 'Достигнута максимальная накопленная сумма в фискальной памяти ФМ при операции возврат. Следует заменить ФМ на новый.',
    uzText: 'FM fiskal xotirasida qaytarish amaliyotida maksimal yig\'ilgan summaga yetildi. FM ni yangisiga almashtirish kerak.',
    keywords: ['cash', 'refund', 'fiscal', 'fm', 'return'],
    category: 'errors'
  },
  {
    order: 1007,
    code: 'NOT_ENOUGH_SUM_FOR_REFUND',
    ruText: 'В фискальной памяти ФМ недостаточно суммы от продаж для выполнения операции возврат',
    uzText: 'FM fiskal xotirasida qaytarish amaliyotini bajarish uchun sotuvlardan yetarli suma yo\'q',
    keywords: ['refund', 'return', 'fiscal', 'fm'],
    category: 'errors'
  },
  {
    order: 1008,
    code: 'VAT_ACCUMULATOR_OVERFLOW',
    ruText: 'Достигнута максимальная накопленная сумма НДС в фискальной памяти ФМ. Следует заменить ФМ на новый.',
    uzText: 'FM fiskal xotirasida QQS bo\'yicha maksimal yig\'ilgan summaga yetildi. FM ni yangisiga almashtirish kerak.',
    keywords: ['vat', 'nds', 'fiscal', 'fm', 'tax'],
    category: 'errors'
  },
  {
    order: 1009,
    code: 'NOT_ENOUGH_VAT_FOR_REFUND',
    ruText: 'В фискальной памяти ФМ недостаточно суммы НДС от продаж для выполнения операции возврат',
    uzText: 'FM fiskal xotirasida qaytarish amaliyotini bajarish uchun QQS dan yetarli suma yo\'q',
    keywords: ['vat', 'nds', 'refund', 'fiscal'],
    category: 'errors'
  },
  {
    order: 1010,
    code: 'TOTAL_COUNT_OVERFLOW_OPEN_NEW_ZREPORT',
    ruText: 'Достигнуто максимальное кол-во операций (29999) в текущем ZReport. Закройте текущий ZReport и откройте новый.',
    uzText: 'Joriy Z-hisobotda maksimal operatsiyalar soni (29999) ga yetdi. Joriy Z-hisobotni yoping va yangisini oching.',
    keywords: ['z-report', 'zreport', 'count', 'operations'],
    category: 'errors'
  },
  {
    order: 1011,
    code: 'TOTAL_CASH_OVERFLOW_OPEN_NEW_ZREPORT',
    ruText: 'Достигнута максимальная накопленная сумма в текущем ZReport. Закройте текущий ZReport и откройте новый.',
    uzText: 'Joriy Z-hisobotda maksimal yig\'ilgan summaga yetildi. Joriy Z-hisobotni yoping va yangisini oching.',
    keywords: ['z-report', 'zreport', 'cash', 'overflow'],
    category: 'errors'
  },
  {
    order: 1012,
    code: 'TOTAL_CARD_OVERFLOW_OPEN_NEW_ZREPORT',
    ruText: 'Достигнута максимальная накопленная сумма в текущем ZReport. Закройте текущий ZReport и откройте новый.',
    uzText: 'Joriy Z-hisobotda maksimal yig\'ilgan summaga yetildi. Joriy Z-hisobotni yoping va yangisini oching.',
    keywords: ['z-report', 'zreport', 'card', 'overflow'],
    category: 'errors'
  },
  {
    order: 1013,
    code: 'TOTAL_VAT_OVERFLOW_OPEN_NEW_ZREPORT',
    ruText: 'Достигнута максимальная накопленная сумма НДС в текущем ZReport. Закройте текущий ZReport и откройте новый.',
    uzText: 'Joriy Z-hisobotda QQS bo\'yicha maksimal yig\'ilgan summaga yetildi. Joriy Z-hisobotni yoping va yangisini oching.',
    keywords: ['z-report', 'zreport', 'vat', 'nds'],
    category: 'errors'
  },
  {
    order: 1014,
    code: 'CASH_ACCUMULATOR_OVERFLOW',
    ruText: 'Достигнута максимальная накопленная сумма в фискальной памяти ФМ при операции продажа. Следует заменить ФМ на новый.',
    uzText: 'FM fiskal xotirasida sotish amaliyotida maksimal yig\'ilgan summaga yetildi. FM ni yangisiga almashtirish kerak.',
    keywords: ['cash', 'fiscal', 'fm', 'sale'],
    category: 'errors'
  },
  {
    order: 1015,
    code: 'CARD_ACCUMULATOR_OVERFLOW',
    ruText: 'Достигнута максимальная накопленная сумма в фискальной памяти ФМ при операции продажа. Следует заменить ФМ на новый.',
    uzText: 'FM fiskal xotirasida sotish amaliyotida maksimal yig\'ilgan summaga yetildi. FM ni yangisiga almashtirish kerak.',
    keywords: ['card', 'fiscal', 'fm', 'sale'],
    category: 'errors'
  },
  {
    order: 1016,
    code: 'LOCKED_SYNC_WITH_SERVER',
    ruText: 'ФМ заблокирован. Требуется синхронизация состояния ФМ с сервером.',
    uzText: 'FM bloklangan. FM holatini server bilan sinxronlashtirish talab qilinadi.',
    keywords: ['fiscal', 'fm', 'sync', 'locked', 'block'],
    category: 'errors'
  },
  {
    order: 1017,
    code: 'DATETIME_SYNC_WITH_SERVER',
    ruText: 'Передаваемое дата-время больше на 2 дня чем дата-время последней операции в ФМ. Настройте реальное время в ККМ и повторите попытку или выполните синхронизацию состояния ФМ с сервером и повторите попытку.',
    uzText: 'Uzatilayotgan sana-vaqt FM dagi oxirgi operatsiya sana-vaqtidan 2 katta katta. KKM da real vaqtni sozlang va qayta urinib ko\'ring yoki FM holatini server bilan sinxronlashtiring.',
    keywords: ['datetime', 'sync', 'fiscal', 'fm', 'time'],
    category: 'errors'
  },
  {
    order: 1018,
    code: 'ALREADY_POS_LOCKED',
    ruText: 'ФМ уже привязан к POS-системе или к ККМ секретным ключём.',
    uzText: 'FM allaqachon POS-tizimiga yoki KKM ga maxfiy kalit bilan bog\'langan.',
    keywords: ['fiscal', 'fm', 'pos', 'locked', 'kkms'],
    category: 'errors'
  },
  {
    order: 1019,
    code: 'POS_AUTH_FAIL',
    ruText: 'ФМ требует передачи правильного секретного ключа для идентификации POS-системы или ККМ.',
    uzText: 'FM POS-tizimi yoki KKM ni identifikatsiya qilish uchun to\'g\'ri maxfiy kalit uzatishni talab qiladi.',
    keywords: ['fiscal', 'fm', 'pos', 'auth', 'key'],
    category: 'errors'
  },
  {
    order: 1020,
    code: 'ZREPORTS_MEMORY_FULL',
    ruText: 'Память ФМ для хранения ZReport заполнена. Следует заменить ФМ на новый.',
    uzText: 'Z-hisobotlarni saqlash uchun FM xotirasi to\'ldi. FM ni yangisiga almashtirish kerak.',
    keywords: ['z-report', 'zreport', 'memory', 'fiscal', 'fm'],
    category: 'errors'
  },
  {
    order: 1021,
    code: 'RECEIPTS_MEMORY_FULL',
    ruText: 'Память ФМ для хранения Receipt заполнена, выполните синхронизацию файлов с сервером для освобождения памяти.',
    uzText: 'Cheklarni saqlash uchun FM xotirasi to\'ldi, xotirani bo\'shatish uchun fayllarni server bilan sinxronlashtiring.',
    keywords: ['receipt', 'memory', 'fiscal', 'fm', 'sync'],
    category: 'errors'
  },
  {
    order: 1022,
    code: 'NOT_ENOUGH_MEMORY',
    ruText: 'Память ФМ заполнена, выполните синхронизацию файлов (и синхронизация состояния ФМ) с сервером для освобождения памяти.',
    uzText: 'FM xotirasi to\'ldi, xotirani bo\'shatish uchun fayllarni (va FM holatini) server bilan sinxronlashtiring.',
    keywords: ['memory', 'fiscal', 'fm', 'sync'],
    category: 'errors'
  },
  {
    order: 1023,
    code: 'INCORRECT_P1P2',
    ruText: 'Передано неправильное значение параметров P1,P2',
    uzText: 'P1, P2 parametrlari noto\'g\'ri qiymat uzatildi',
    keywords: ['fiscal', 'fm', 'parameter', 'error'],
    category: 'errors'
  },
  {
    order: 1024,
    code: 'INS_NOT_SUPPORTED',
    ruText: 'Передано неправильное значение параметра INS',
    uzText: 'INS parametri noto\'g\'ri qiymat uzatildi',
    keywords: ['fiscal', 'fm', 'parameter', 'ins'],
    category: 'errors'
  },
  {
    order: 1025,
    code: 'WRONG_LENGTH',
    ruText: 'Передано неправильный размер DATA',
    uzText: 'DATA o\'lchami noto\'g\'ri uzatildi',
    keywords: ['fiscal', 'fm', 'data', 'parameter'],
    category: 'errors'
  },
  {
    order: 1026,
    code: 'WRONG_DATA',
    ruText: 'Передано неправильное значение DATA',
    uzText: 'DATA qiymati noto\'g\'ri uzatildi',
    keywords: ['fiscal', 'fm', 'data', 'parameter'],
    category: 'errors'
  },
  {
    order: 1027,
    code: 'noCardFound',
    ruText: 'Карта не найдена',
    uzText: 'Karta topilmadi',
    keywords: ['card', 'payment', 'client'],
    category: 'errors'
  }
];

// Screenshot mappings for error lessons (order -> screenshot filename)
const ERROR_SCREENSHOTS = {
  1001: '137_request.png', // Z-report
  1002: '009_cabinet__tariffs.png', // Settings/time
  1003: '037_finance__receipt.png', // Receipts
  1004: '137_request.png', // Z-report
  1005: '037_finance__receipt.png', // Receipt
  1006: '107_orders__refunds.png', // Refund
  1007: '107_orders__refunds.png', // Refund
  1008: '129_reports.png', // Reports/VAT
  1009: '107_orders__refunds.png', // Refund
  1010: '137_request.png', // Z-report
  1011: '137_request.png', // Z-report
  1012: '137_request.png', // Z-report
  1013: '137_request.png', // Z-report
  1014: '037_finance__receipt.png', // Sale
  1015: '037_finance__receipt.png', // Sale
  1016: '007_cabinet__license.png', // FM status
  1017: '009_cabinet__tariffs.png', // Time settings
  1018: '007_cabinet__license.png', // FM binding
  1019: '007_cabinet__license.png', // FM auth
  1020: '137_request.png', // Z-report memory
  1021: '037_finance__receipt.png', // Receipt memory
  1022: '007_cabinet__license.png', // FM memory
  1023: '007_cabinet__license.png', // FM parameters
  1024: '007_cabinet__license.png', // FM parameters
  1025: '007_cabinet__license.png', // FM data
  1026: '007_cabinet__license.png', // FM data
  1027: '021_clients__loyalty.png', // Card/client
};

function log(...a) { console.log('[error-lessons]', ...a); }

async function callMistralForError(errorLesson, screenshotUrl) {
  const system = `Ты эксперт по CRM/админ-панели Lume и фискальным модулям (ФМ). Твоя задача — создать подробный обучающий урок по ошибке ФМ.

ВАЖНО: Отвечай СТРОГО JSON, без markdown-кодоблоков и текста вне JSON.

Требования к контенту:
1. Объясни причину ошибки простым языком
2. Опиши пошаговое решение проблемы
3. Дай рекомендации по предотвращению
4. Русский текст пиши кириллицей
5. Узбекский текст пиши ЛАТИНИЦЕЙ — НЕ кириллицей!

Структура ответа:
{
  "ruName": "Название ошибки на русском (4-8 слов)",
  "uzName": "Xato nomi o'zbek tilida (4-8 so'z)",
  "ruDescription": "Подробное описание ошибки: что означает, почему возникает, какие последствия. 3-6 предложений.",
  "uzDescription": "Xatoning batafsil tavsifi: nima ma'noni bildiradi, nega yuzaga keladi, qanday oqibatlarga olib keladi. 3-6 jumlalar.",
  "ruFunctionality": "Описание решения: какие действия нужно выполнить для устранения ошибки. 2-5 предложений.",
  "uzFunctionality": "Yechim tavsifi: xatoni bartaraf qilish uchun qanday amallarni bajarish kerak. 2-5 jumlalar.",
  "ruSteps": "Пошаговая инструкция решения (JSON-массив строк, 3-7 шагов)",
  "uzSteps": "Yechim bo'yicha qadam-baqadam ko'rsatmalar (JSON-massiv, 3-7 qadam)",
  "ruTips": "Полезные советы по предотвращению ошибки. 2-4 предложения.",
  "uzTips": "Xatoni oldini olish bo'yicha foydali maslahatlar. 2-4 jumlalar.",
  "ruUseCase": "В каких ситуациях возникает эта ошибка. Практические примеры. 2-3 предложения.",
  "uzUseCase": "Bu xato qanday vaziyatlarda yuzaga keladi. Amaliy misollar. 2-3 jumlalar."
}`;

  const userText = `Ошибка ФМ (Фискальный Модуль):
Код ошибки: ${errorLesson.code}
Описание: ${errorLesson.ruText}
Описание (уз): ${errorLesson.uzText}

Создай подробный обучающий урок по этой ошибке для сотрудников, работающих с Lume CRM.
Верни JSON со всеми полями: ruName, uzName, ruDescription, uzDescription, ruFunctionality, uzFunctionality, ruSteps (массив), uzSteps (массив), ruTips, uzTips, ruUseCase, uzUseCase.`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userText }
  ];

  // If we have a screenshot, add it
  if (screenshotUrl) {
    // For now, just use text-only (screenshot URL would need to be downloaded first)
    // In future, we can download the image and pass to vision model
  }

  const body = {
    model: 'mistral-large-latest', // Use text model for error lessons
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages,
  };

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Mistral ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    const m = /\{[\s\S]*\}/.exec(content);
    return m ? JSON.parse(m[0]) : {};
  }
}

function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split('\n').filter(s => s.trim());
    }
  }
  return [];
}

async function upsertErrorLesson(errorLesson, desc, screenshotUrl) {
  const ruName = (desc.ruName && String(desc.ruName).trim()) || `Ошибка: ${errorLesson.code}`;
  const uzName = (desc.uzName && String(desc.uzName).trim()) || `Xato: ${errorLesson.code}`;
  const ruDescription = (desc.ruDescription && String(desc.ruDescription).trim()) || errorLesson.ruText;
  const uzDescription = (desc.uzDescription && String(desc.uzDescription).trim()) || errorLesson.uzText;
  const ruFunctionality = (desc.ruFunctionality && String(desc.ruFunctionality).trim()) || null;
  const uzFunctionality = (desc.uzFunctionality && String(desc.uzFunctionality).trim()) || null;
  const ruStepsArray = ensureArray(desc.ruSteps);
  const uzStepsArray = ensureArray(desc.uzSteps);
  const ruSteps = ruStepsArray.length > 0 ? JSON.stringify(ruStepsArray) : null;
  const uzSteps = uzStepsArray.length > 0 ? JSON.stringify(uzStepsArray) : null;
  const ruTips = (desc.ruTips && String(desc.ruTips).trim()) || null;
  const uzTips = (desc.uzTips && String(desc.uzTips).trim()) || null;
  const ruUseCase = (desc.ruUseCase && String(desc.ruUseCase).trim()) || null;
  const uzUseCase = (desc.uzUseCase && String(desc.uzUseCase).trim()) || null;

  const data = {
    order: errorLesson.order,
    category: errorLesson.category,
    screenshot: screenshotUrl,
    ruName,
    uzName,
    ruDescription,
    uzDescription,
    ruFunctionality,
    uzFunctionality,
    ruSteps,
    uzSteps,
    ruTips,
    uzTips,
    ruUseCase,
    uzUseCase,
    updatedAt: new Date(),
  };

  const existing = await prisma.lesson.findFirst({ where: { order: errorLesson.order } });
  if (existing) {
    return prisma.lesson.update({ where: { id: existing.id }, data });
  }
  return prisma.lesson.create({ data });
}

async function alreadyExists(order) {
  const existing = await prisma.lesson.findFirst({ where: { order } });
  return Boolean(existing && existing.ruDescription && existing.ruDescription.length > 30);
}

async function main() {
  if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY is empty');

  log(`Processing ${ERROR_LESSONS.length} error lessons...`);

  for (const errorLesson of ERROR_LESSONS) {
    const tag = `[${errorLesson.order}] ${errorLesson.code}`;

    if (!FORCE && await alreadyExists(errorLesson.order)) {
      log(`${tag} already exists, skip`);
      continue;
    }

    const screenshotFile = ERROR_SCREENSHOTS[errorLesson.order];
    const screenshotUrl = screenshotFile ? `${SCREENSHOT_BASE_URL}/${screenshotFile}` : null;

    let desc = {};
    try {
      desc = await callMistralForError(errorLesson, screenshotUrl);
      log(`${tag} OK -> "${(desc.ruName || '').slice(0, 60)}"`);
    } catch (e) {
      log(`${tag} Mistral failed: ${e.message}`);
      // Use default values
      desc = {
        ruName: `Ошибка ФМ: ${errorLesson.code}`,
        uzName: `FM xatosi: ${errorLesson.code}`,
        ruDescription: errorLesson.ruText,
        uzDescription: errorLesson.uzText,
      };
    }

    await upsertErrorLesson(errorLesson, desc, screenshotUrl);
  }

  log('Done!');
}

main()
  .catch((e) => {
    console.error('[error-lessons] fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
