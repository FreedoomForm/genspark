import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const TMP_DIR = path.join(ROOT, '.video-tmp');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '200');
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === '1';
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map((s) => s.trim()).filter(Boolean);
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_ONLY = process.env.UPLOAD_ONLY === '1';
const EDGE_TTS_BIN = fs.existsSync('/usr/local/bin/edge-tts') ? '/usr/local/bin/edge-tts' : 'edge-tts';
const FPS = Number(process.env.VIDEO_FPS || '24');
const WIDTH = 854;
const HEIGHT = 480;
const MAX_ZOOM = Number(process.env.VIDEO_MAX_ZOOM || '1.32');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'lesson';
}

function ffPath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' }).trim();
  return Math.max(6, Math.ceil(Number(out || '6')));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function categoryFallback(category) {
  return {
    cabinet: 'dashboard.png',
    warehouse: 'products.png',
    reference: 'personnel.png',
    finance: 'accounts.png',
    reports: 'sales_report.png',
    settings: 'interface.png',
  }[category] || 'dashboard.png';
}

function screenshotFor(lesson) {
  const screenshot = lesson.screenshot ? path.join(ROOT, 'public', lesson.screenshot) : '';
  if (screenshot && fs.existsSync(screenshot)) return screenshot;

  const t = `${lesson.ruName || ''} ${lesson.uzName || ''} ${lesson.ruDescription || ''} ${lesson.ruFunctionality || ''} ${lesson.uiLocation || ''}`.toLowerCase();
  const rules = [
    ['баланс balans', 'balance.png'],
    ['товар tovar', 'products.png'],
    ['приход kirim', 'receipt.png'],
    ['возврат qaytar', 'receipt_return.png'],
    ['трансфер transfer', 'transfer.png'],
    ['реализац realizats', 'realization.png'],
    ['переоцен qarta bahol', 'reprice.png'],
    ['инвентар inventar', 'inventory.png'],
    ['списани yozib', 'writeoff.png'],
    ['группиров guruh', 'grouping.png'],
    ["весов og'irlik", 'weighted_products.png'],
    ['импорт import', 'import_products.png'],
    ['техкарт tex-kart', 'tech_cards.png'],
    ['изготов ishlab chiqar', 'manufacturing_act.png'],
    ['персонал personal', 'personnel.png'],
    ['водител haydov', 'drivers.png'],
    ['смен smena', 'shifts.png'],
    ['клиент mijoz', 'clients.png'],
    ['контрагент kontragent', 'contractors.png'],
    ['лояль loyal', 'loyalty.png'],
    ['телеграм telegram', 'telegram_bot.png'],
    ['подпис obuna', 'subscriptions.png'],
    ['тариф tarif', 'tariffs.png'],
    ['тег tag', 'tags.png'],
    ['данные kompaniya', 'company_data.png'],
    ['касс kassa', 'cash_registers.png'],
    ['ценник yorliq', 'pricetags.png'],
    ['печать chop', 'print_pricetags.png'],
    ['abc', 'abc_report.png'],
    ['xyz', 'xyz_report.png'],
    ['отчет hisobot report', 'sales_report.png'],
  ];

  for (const [needle, file] of rules) {
    if (needle.split(' ').some((k) => k && t.includes(k))) {
      return path.join(ROOT, 'public', 'screenshots', file);
    }
  }

  return path.join(ROOT, 'public', 'screenshots', categoryFallback(lesson.category));
}

function narration(lesson, locale) {
  // Limit text to avoid TTS failures (max ~500 chars)
  const MAX_DESC = 150;
  const MAX_FUNC = 150;
  
  if (locale === 'ru') {
    const desc = (lesson.ruDescription || '').substring(0, MAX_DESC);
    const func = (lesson.ruFunctionality || '').substring(0, MAX_FUNC);
    const text = `Урок ${lesson.order}. ${lesson.ruName}. ${desc}. ${func}. Расположение: ${lesson.uiLocation || ''}.`;
    return text.substring(0, 500);
  }
  const desc = (lesson.uzDescription || '').substring(0, MAX_DESC);
  const func = (lesson.uzFunctionality || '').substring(0, MAX_FUNC);
  const text = `${lesson.order}-dars. ${lesson.uzName}. ${desc}. ${func}. Joylashuvi: ${lesson.uiLocation || ''}.`;
  return text.substring(0, 500);
}

// Real coordinates from VLM analysis (converted from % to pixels, WIDTH=854, HEIGHT=480)
function sidebarTarget(location) {
  const sidebarMap = [
    ['главная', { x: 53, y: 70 }],  // ~6.25%, ~14.5%
    ['складские операции', { x: 53, y: 102 }],  // ~6.25%, ~21%
    ['справочник', { x: 53, y: 132 }],  // ~6.25%, ~27.5%
    ['финансовые операции', { x: 53, y: 163 }],  // ~6.25%, ~34%
    ['отчёты', { x: 53, y: 194 }],  // ~6.25%, ~40.5%
    ['отчеты', { x: 53, y: 194 }],
    ['настройки', { x: 53, y: 225 }],  // ~6.25%, ~47%
    ['кабинет', { x: 53, y: 256 }],  // ~6.25%, ~53.5%
    ['выход', { x: 53, y: 450 }],  // bottom area
  ];

  for (const [needle, target] of sidebarMap) {
    if (location.includes(needle)) return target;
  }

  return { x: 53, y: 102 };
}

function targetForProducts(location, lessonName) {
  const t = `${location} ${lessonName}`;
  // Real coordinates from VLM analysis of products.png
  if (containsAny(t, ['поле поиска', 'поиск'])) return { x: 512, y: 175 };  // ~60%, ~36%
  if (containsAny(t, ['фильтры', 'фильтр'])) {
    if (containsAny(t, ['категория'])) return { x: 640, y: 175 };  // ~75%, ~36%
    if (containsAny(t, ['склад'])) return { x: 683, y: 175 };  // ~80%, ~36%
    return { x: 683, y: 175 };
  }
  if (containsAny(t, ['иконка карандаша', 'редактировать'])) return { x: 790, y: 168 };  // right side edit
  if (containsAny(t, ['иконка корзины', 'удалить'])) return { x: 820, y: 168 };  // right side delete
  if (containsAny(t, ['иконка звезды', 'избран'])) return { x: 760, y: 168 };
  if (containsAny(t, ['клик на название', 'карточка'])) return { x: 320, y: 168 };  // product name
  if (containsAny(t, ['чекбоксы', 'массовые действия', 'массовое'])) return { x: 210, y: 168 };
  if (containsAny(t, ['штрих-код'])) return { x: 450, y: 79 };
  if (containsAny(t, ['история'])) return { x: 550, y: 79 };
  if (containsAny(t, ['поставщик'])) return { x: 300, y: 96 };
  if (containsAny(t, ['покупатель'])) return { x: 300, y: 96 };
  // Main action button "Добавить товар" - right side top
  if (containsAny(t, ['создать', 'добавить', 'экспорт', 'провести', 'копировать', 'печать', 'отменить'])) return { x: 790, y: 36 };
  return { x: 790, y: 36 };  // Default: "Добавить" button
}

function targetForDashboard(location, lessonName) {
  const t = `${location} ${lessonName}`;
  // Real coordinates from VLM analysis of dashboard.png
  if (t.includes('верхняя панель') && containsAny(t, ['имя пользователя', 'профиль'])) return { x: 790, y: 34 };
  if (containsAny(t, ['главная'])) return { x: 53, y: 70 };  // sidebar
  if (containsAny(t, ['кабинет'])) return { x: 53, y: 256 };  // sidebar
  if (containsAny(t, ['выход'])) return { x: 53, y: 450 };
  if (containsAny(t, ['смена пароля'])) return { x: 360, y: 95 };
  if (containsAny(t, ['уведомления'])) return { x: 360, y: 119 };
  if (containsAny(t, ['история входов'])) return { x: 360, y: 144 };
  if (containsAny(t, ['удалить аккаунт'])) return { x: 360, y: 169 };
  // Grid buttons on dashboard (Счета, Проданные чеки, etc.)
  if (containsAny(t, ['счета'])) return { x: 240, y: 79 };  // ~28%, ~16.5%
  if (containsAny(t, ['проданные чеки'])) return { x: 375, y: 79 };  // ~44%
  if (containsAny(t, ['товары'])) return { x: 502, y: 79 };  // ~59%
  if (containsAny(t, ['приход'])) return { x: 632, y: 79 };  // ~74%
  if (containsAny(t, ['отчет о продаже'])) return { x: 780, y: 79 };  // ~91%
  // Warehouse operations row
  if (containsAny(t, ['возврат прихода'])) return { x: 502, y: 211 };  // ~59%, ~44%
  if (containsAny(t, ['трансфер'])) return { x: 632, y: 211 };  // ~74%
  if (containsAny(t, ['реализация'])) return { x: 780, y: 211 };  // ~91%
  if (containsAny(t, ['переоценка'])) return { x: 240, y: 326 };  // ~28%, ~68%
  if (containsAny(t, ['инвентаризация'])) return { x: 375, y: 326 };
  if (containsAny(t, ['списание'])) return { x: 502, y: 326 };
  if (containsAny(t, ['группировка'])) return { x: 632, y: 326 };
  if (containsAny(t, ['весовые товары'])) return { x: 780, y: 326 };
  return { x: 427, y: 120 };  // Default: center
}

function targetForBalance(location, lessonName) {
  const t = `${location} ${lessonName}`;
  // Real coordinates from VLM analysis of balance.png
  if (containsAny(t, ['баланс'])) return { x: 630, y: 16 };  // top right ~74%
  if (containsAny(t, ['пополнение'])) return { x: 680, y: 16 };  // top right
  if (containsAny(t, ['дата', 'период'])) return { x: 284, y: 45 };  // ~33%
  if (containsAny(t, ['сформировать'])) return { x: 495, y: 45 };  // ~58%
  return { x: 630, y: 16 };
}

function targetForListPage(location, lessonName) {
  const t = `${location} ${lessonName}`;
  if (location.includes('боковое меню')) return sidebarTarget(location);
  // Main action buttons (Добавить, Создать, etc.) - top right ~92-94%
  if (containsAny(t, ['кнопка "создать"', 'кнопка "добавить"', 'создать', 'добавить', 'начислить', 'выплатить', 'подключить', 'сохранить', 'оплатить', 'открыть', 'закрыть'])) return { x: 790, y: 36 };
  if (containsAny(t, ['кнопка "печать"', 'печать', 'экспорт', 'сменить'])) return { x: 600, y: 36 };
  if (containsAny(t, ['кнопка "удалить"', 'удалить', 'кнопка "отменить"', 'отменить'])) return { x: 820, y: 168 };
  if (containsAny(t, ['кнопка "провести"', 'провести', 'кнопка "отправить"', 'отправить', 'кнопка "принять"', 'принять'])) return { x: 760, y: 168 };
  // Filter area
  if (containsAny(t, ['фильтры', 'фильтр'])) {
    if (containsAny(t, ['дата', 'период'])) return { x: 300, y: 54 };  // ~35%
    if (containsAny(t, ['поставщик'])) return { x: 450, y: 54 };  // ~52%
    if (containsAny(t, ['статус'])) return { x: 520, y: 54 };  // ~61%
    if (containsAny(t, ['касса'])) return { x: 590, y: 54 };  // ~69%
    return { x: 450, y: 54 };
  }
  // Tabs (Оформленные, Черновик, etc.)
  if (containsAny(t, ['оформленные'])) return { x: 250, y: 94 };
  if (containsAny(t, ['отправленные'])) return { x: 340, y: 94 };
  if (containsAny(t, ['черновик'])) return { x: 430, y: 94 };
  if (containsAny(t, ['все'])) return { x: 220, y: 94 };
  // Input fields
  if (containsAny(t, ['поле'])) {
    if (containsAny(t, ['должность'])) return { x: 300, y: 93 };
    if (containsAny(t, ['pin'])) return { x: 530, y: 93 };
    if (containsAny(t, ['автомобиль'])) return { x: 530, y: 93 };
    if (containsAny(t, ['логотип'])) return { x: 410, y: 89 };
    if (containsAny(t, ['язык'])) return { x: 367, y: 105 };
    return { x: 360, y: 89 };
  }
  if (containsAny(t, ['вкладка'])) {
    if (containsAny(t, ['права'])) return { x: 476, y: 74 };
    if (containsAny(t, ['история'])) return { x: 557, y: 74 };
    return { x: 476, y: 74 };
  }
  if (containsAny(t, ['колонка'])) return { x: 495, y: 103 };
  if (containsAny(t, ['клик на чек', 'клик на название'])) return { x: 290, y: 103 };
  return { x: 790, y: 36 };  // Default: action button
}

// Screenshot-specific targets based on VLM analysis
function targetForShot(baseName, location, lessonName) {
  // Map specific screenshots to their button positions
  const screenshotTargets = {
    'products.png': targetForProducts,
    'products_page.png': targetForProducts,
    'products_new.png': targetForProducts,
    'dashboard.png': targetForDashboard,
    'dashboard_full.png': targetForDashboard,
    'dashboard_new.png': targetForDashboard,
    'balance.png': targetForBalance,
    // Receipt/Coming page
    'receipt.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['создать приход', 'создать'])) return { x: 795, y: 36 };
      if (containsAny(t, ['импорт'])) return { x: 683, y: 36 };
      if (containsAny(t, ['оформленные'])) return { x: 250, y: 254 };
      if (containsAny(t, ['отправленные'])) return { x: 350, y: 254 };
      if (containsAny(t, ['черновик'])) return { x: 435, y: 254 };
      return { x: 795, y: 36 };
    },
    // Inventory
    'inventory.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новая инвентаризация', 'создать'])) return { x: 780, y: 36 };
      if (containsAny(t, ['оформленные'])) return { x: 250, y: 96 };
      if (containsAny(t, ['отправленные'])) return { x: 350, y: 96 };
      if (containsAny(t, ['черновик'])) return { x: 435, y: 96 };
      return { x: 780, y: 36 };
    },
    // Transfer
    'transfer.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['добавить', 'создать'])) return { x: 800, y: 34 };
      if (containsAny(t, ['все'])) return { x: 220, y: 90 };
      if (containsAny(t, ['отправленные'])) return { x: 300, y: 90 };
      if (containsAny(t, ['полученные'])) return { x: 395, y: 90 };
      return { x: 800, y: 34 };
    },
    // Realization
    'realization.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новая реализация', 'создать'])) return { x: 785, y: 36 };
      if (containsAny(t, ['оформленные'])) return { x: 250, y: 132 };
      if (containsAny(t, ['отправленные'])) return { x: 350, y: 132 };
      if (containsAny(t, ['черновик'])) return { x: 435, y: 132 };
      return { x: 785, y: 36 };
    },
    // Clients
    'clients.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['добавить', 'создать'])) return { x: 800, y: 36 };
      if (containsAny(t, ['поиск'])) return { x: 512, y: 185 };
      return { x: 800, y: 36 };
    },
    // Contractors
    'contractors.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['добавить контрагента', 'добавить', 'создать'])) return { x: 772, y: 36 };
      if (containsAny(t, ['поиск'])) return { x: 508, y: 97 };
      return { x: 772, y: 36 };
    },
    // Personnel
    'personnel.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['счета'])) return { x: 240, y: 79 };
      if (containsAny(t, ['проданные чеки'])) return { x: 375, y: 79 };
      if (containsAny(t, ['товары'])) return { x: 502, y: 79 };
      if (containsAny(t, ['приход'])) return { x: 632, y: 79 };
      return { x: 427, y: 120 };
    },
    // Settings pages
    'interface.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['светлая'])) return { x: 587, y: 108 };
      if (containsAny(t, ['темная'])) return { x: 685, y: 108 };
      if (containsAny(t, ['авто'])) return { x: 783, y: 108 };
      if (containsAny(t, ['o\'zbek', 'uzbek'])) return { x: 720, y: 190 };
      if (containsAny(t, ['русский', 'russian'])) return { x: 792, y: 190 };
      return { x: 427, y: 120 };
    },
    'parameters.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новый параметр', 'создать'])) return { x: 782, y: 31 };
      if (containsAny(t, ['удалить'])) return { x: 828, y: 84 };
      return { x: 782, y: 31 };
    },
    'tags.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новый тег', 'создать'])) return { x: 790, y: 31 };
      if (containsAny(t, ['удалить'])) return { x: 826, y: 84 };
      return { x: 790, y: 31 };
    },
    'cash_registers.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['edit', 'редактировать'])) return { x: 790, y: 137 };
      return { x: 790, y: 36 };
    },
    'company_data.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['назад', 'back'])) return { x: 210, y: 31 };
      return { x: 427, y: 120 };
    },
    'subscriptions.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['назад', 'back'])) return { x: 210, y: 31 };
      return { x: 427, y: 120 };
    },
    'loyalty.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['редактирование', 'edit'])) return { x: 783, y: 31 };
      if (containsAny(t, ['история'])) return { x: 770, y: 262 };
      return { x: 427, y: 120 };
    },
    'sales_report.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['назад', 'back'])) return { x: 210, y: 31 };
      return { x: 427, y: 120 };
    },
    'shifts.png': (loc, name) => {
      return { x: 210, y: 31 };  // Back button or page title
    },
    'drivers.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['добавить', 'создать'])) return { x: 788, y: 40 };
      return { x: 788, y: 40 };
    },
    'tech_cards.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новая техкарта', 'создать'])) return { x: 760, y: 34 };
      return { x: 760, y: 34 };
    },
    'grouping.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['сгруппировать', 'создать'])) return { x: 770, y: 34 };
      if (containsAny(t, ['фильтр'])) return { x: 750, y: 91 };
      return { x: 770, y: 34 };
    },
    'favorite_products.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['удалить'])) return { x: 780, y: 168 };
      return { x: 780, y: 168 };
    },
    'writeoff.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новое списание', 'создать'])) return { x: 780, y: 32 };
      if (containsAny(t, ['оформленные'])) return { x: 250, y: 94 };
      if (containsAny(t, ['отправленные'])) return { x: 340, y: 94 };
      if (containsAny(t, ['черновик'])) return { x: 430, y: 94 };
      return { x: 780, y: 32 };
    },
    'reprice.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['создать переоценку', 'создать'])) return { x: 780, y: 36 };
      if (containsAny(t, ['оформленные'])) return { x: 250, y: 94 };
      if (containsAny(t, ['отправленные'])) return { x: 340, y: 94 };
      if (containsAny(t, ['черновик'])) return { x: 430, y: 94 };
      return { x: 780, y: 36 };
    },
    'import_products.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['добавить', 'создать'])) return { x: 800, y: 36 };
      if (containsAny(t, ['импорт'])) return { x: 210, y: 36 };
      return { x: 800, y: 36 };
    },
    'print_pricetags.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['печать бар-кода', 'печать'])) return { x: 508, y: 370 };
      return { x: 508, y: 370 };
    },
    'telegram_bot.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['отправить тестовый текст', 'отправить'])) return { x: 710, y: 86 };
      return { x: 710, y: 86 };
    },
    'sms_blast.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['новая рассылка', 'создать'])) return { x: 783, y: 32 };
      return { x: 783, y: 32 };
    },
    'salary.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['поиск'])) return { x: 474, y: 214 };
      if (containsAny(t, ['сортировать'])) return { x: 585, y: 214 };
      return { x: 474, y: 214 };
    },
    'mutual_settlements.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['оформить', 'создать'])) return { x: 800, y: 31 };
      if (containsAny(t, ['назад', 'back'])) return { x: 210, y: 31 };
      return { x: 800, y: 31 };
    },
    'abc_report.png': (loc, name) => {
      return { x: 833, y: 36 };  // info button
    },
    'xyz_report.png': (loc, name) => {
      return { x: 833, y: 36 };  // info button
    },
    'top_sales.png': (loc, name) => {
      return { x: 427, y: 120 };
    },
    'edo.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['войти', 'login'])) return { x: 788, y: 161 };
      return { x: 788, y: 161 };
    },
    'pricing.png': (loc, name) => {
      const t = `${loc} ${name}`;
      if (containsAny(t, ['назад', 'back'])) return { x: 210, y: 36 };
      return { x: 427, y: 120 };
    },
    'tariffs.png': (loc, name) => {
      // Dashboard-like with grid buttons
      return targetForDashboard(location, lessonName);
    },
    'z_reports.png': (loc, name) => {
      return { x: 210, y: 31 };  // back button
    },
  };

  const handler = screenshotTargets[baseName.toLowerCase()];
  if (handler) return handler(location, lessonName);
  return targetForListPage(location, lessonName);
}

function coords(lesson) {
  const location = String(lesson.uiLocation || '').toLowerCase();
  const lessonName = String(lesson.ruName || '').toLowerCase();
  const shot = lesson.screenshot || categoryFallback(lesson.category);
  const baseName = path.basename(shot || '').toLowerCase();

  const target = targetForShot(baseName, location, lessonName);
  const start = target.x < WIDTH / 2
    ? { x: clamp(target.x + 240, 96, WIDTH - 90), y: clamp(target.y + 140, 88, HEIGHT - 60) }
    : { x: clamp(target.x - 260, 54, WIDTH - 110), y: clamp(target.y + 150, 88, HEIGHT - 60) };

  const focus = {
    w: containsAny(location, ['иконка', 'клик']) ? 64 : containsAny(location, ['поле', 'фильтр']) ? 132 : 110,
    h: containsAny(location, ['иконка', 'клик']) ? 44 : containsAny(location, ['поле', 'фильтр']) ? 42 : 38,
  };

  return {
    x1: start.x,
    y1: start.y,
    x2: clamp(target.x, 36, WIDTH - 36),
    y2: clamp(target.y, 36, HEIGHT - 36),
    focus,
    screenshot: baseName,
  };
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(text || ''), 'utf8');
}

function synthesize(text, locale, outFile) {
  const voice = locale === 'ru' ? 'ru-RU-SvetlanaNeural' : 'uz-UZ-SardorNeural';
  const rate = locale === 'ru' ? '-8%' : '-10%';
  
  try {
    execFileSync(EDGE_TTS_BIN, ['--voice', voice, `--rate=${rate}`, '--text', text, '--write-media', outFile], { 
      stdio: 'ignore',
      timeout: 60000 // 60 second timeout
    });
  } catch (error) {
    console.log(`TTS failed for ${locale}, trying shorter text...`);
    // Try with shorter text (just name)
    const shortText = text.split('.')[0] + '.';
    try {
      execFileSync(EDGE_TTS_BIN, ['--voice', voice, `--rate=${rate}`, '--text', shortText, '--write-media', outFile], { 
        stdio: 'ignore',
        timeout: 30000 
      });
    } catch (error2) {
      console.log(`TTS still failed, creating silent audio...`);
      // Create silent audio as fallback
      execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '6', outFile], { stdio: 'ignore' });
    }
  }
}

function makeVideo(lesson, locale, imagePath, audioPath, outFile) {
  const duration = ffprobeDuration(audioPath);
  const c = coords(lesson);
  const moveEnd = Math.max(2.5, duration * 0.62);
  const zoomEnd = Math.max(3.5, duration * 0.82);
  const clickStart = Math.max(2.2, duration * 0.72);
  const work = path.join(TMP_DIR, `${lesson.order}-${locale}`);
  const title = locale === 'ru' ? lesson.ruName : lesson.uzName;
  const locationWithCoords = `${lesson.uiLocation || ''} • x:${c.x2}, y:${c.y2}`;

  fs.mkdirSync(work, { recursive: true });
  writeText(path.join(work, 'title.txt'), title);
  writeText(path.join(work, 'loc.txt'), locationWithCoords);

  const xExpr = `if(lt(t,${moveEnd}),${c.x1}+(${c.x2 - c.x1})*min(1\\,t/${moveEnd}),${c.x2})`;
  const yExpr = `if(lt(t,${moveEnd}),${c.y1}+(${c.y2 - c.y1})*min(1\\,t/${moveEnd}),${c.y2})`;
  const zoomExpr = `1+(${MAX_ZOOM - 1})*min(1\\,t/${zoomEnd})`;
  const highlightX = c.x2 - Math.round(c.focus.w / 2);
  const highlightY = c.y2 - Math.round(c.focus.h / 2);

  const preZoom = [
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease`,
    `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white`,
    'format=yuv420p',
    `drawbox=x=${highlightX}:y=${highlightY}:w=${c.focus.w}:h=${c.focus.h}:color=yellow@0.55:t=3:enable='between(t,${clickStart - 0.15},${duration})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='●':fontsize=42:fontcolor=black@0.28:x='(${xExpr})-17':y='(${yExpr})-13'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='●':fontsize=28:fontcolor=yellow:borderw=2:bordercolor=black:x='(${xExpr})-12':y='(${yExpr})-9'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='◎':fontsize=62:fontcolor=white@0.92:x='${c.x2 - 25}':y='${c.y2 - 27}':enable='between(t,${clickStart},${clickStart + 0.18})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='◎':fontsize=96:fontcolor=yellow@0.72:x='${c.x2 - 41}':y='${c.y2 - 43}':enable='between(t,${clickStart + 0.1},${clickStart + 0.34})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='✦':fontsize=48:fontcolor=white@0.96:x='${c.x2 - 14}':y='${c.y2 - 30}':enable='between(t,${clickStart},${clickStart + 0.1})'`,
    `scale=w='trunc(${WIDTH}*(${zoomExpr})/2)*2':h='trunc(${HEIGHT}*(${zoomExpr})/2)*2':eval=frame`,
    `crop=${WIDTH}:${HEIGHT}:x='max(0,min(iw-${WIDTH},${c.x2}*(iw/${WIDTH})-${WIDTH}/2))':y='max(0,min(ih-${HEIGHT},${c.y2}*(ih/${HEIGHT})-${HEIGHT}/2))'`,
    `drawbox=x=0:y=0:w=iw:h=58:color=black@0.44:t=fill`,
    `drawbox=x=0:y=ih-76:w=iw:h=76:color=black@0.44:t=fill`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:textfile=${ffPath(path.join(work, 'title.txt'))}:fontsize=28:fontcolor=white:x=24:y=14`,
    `drawtext=fontfile=${ffPath(FONT_REG)}:textfile=${ffPath(path.join(work, 'loc.txt'))}:fontsize=18:fontcolor=white:x=24:y=h-48`,
  ].join(',');

  execFileSync('ffmpeg', [
    '-y',
    '-threads', '1',
    '-loop', '1',
    '-framerate', String(FPS),
    '-t', String(duration),
    '-i', imagePath,
    '-i', audioPath,
    '-filter_complex', `[0:v]${preZoom}[v]`,
    '-map', '[v]',
    '-map', '1:a',
    '-r', String(FPS),
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'stillimage',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-b:v', '900k',
    '-shortest',
    outFile,
  ], { stdio: 'ignore' });
}

function parseVideoMap(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
  } catch {}
  return {};
}

async function uploadVideo(filePath, order, locale, lesson) {
  const fileName = path.basename(filePath);
  if (!BLOB_ENABLED) {
    return `/generated-videos/${fileName}`;
  }

  const blobPath = `lesson-videos/${String(order).padStart(3, '0')}/${locale}/${slugify(locale === 'ru' ? lesson.ruName : lesson.uzName)}.mp4`;
  const buffer = fs.readFileSync(filePath);
  const result = await put(blobPath, buffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'video/mp4',
  });
  return result.url;
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { order: { gte: FROM, lte: TO } },
    orderBy: { order: 'asc' },
  });

  console.log(`Lessons loaded: ${lessons.length}`);
  if (lessons.length === 0) return;

  for (const lesson of lessons) {
    let map = parseVideoMap(lesson.videoUrl);
    if (!map.default && lesson.videoUrl && !lesson.videoUrl.trim().startsWith('{')) {
      map.default = lesson.videoUrl;
    }

    for (const locale of LOCALES) {
      const base = `${String(lesson.order).padStart(3, '0')}-${locale}-${locale === 'ru' ? 'lesson' : slugify(lesson.uzName)}`;
      const audioPath = path.join(TMP_DIR, `${base}.mp3`);
      const videoPath = path.join(OUT_DIR, `${base}.mp4`);
      const alreadyMapped = typeof map[locale] === 'string' && map[locale];
      const localReady = fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100000;
      const c = coords(lesson);

      console.log(`Lesson ${lesson.order} ${locale}: start (${c.screenshot}) -> x:${c.x2}, y:${c.y2}`);

      if (!alreadyMapped || FORCE_REGENERATE) {
        if (!UPLOAD_ONLY && (!localReady || FORCE_REGENERATE)) {
          const shot = screenshotFor(lesson);
          if (!fs.existsSync(shot)) {
            throw new Error(`Screenshot not found for lesson ${lesson.order}: ${shot}`);
          }
          synthesize(narration(lesson, locale), locale, audioPath);
          makeVideo(lesson, locale, shot, audioPath, videoPath);
        }

        if (!(fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100000)) {
          throw new Error(`Video not generated for lesson ${lesson.order} ${locale}`);
        }

        const url = await uploadVideo(videoPath, lesson.order, locale, lesson);
        map[locale] = url;
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { videoUrl: JSON.stringify(map) },
        });
        console.log(`Lesson ${lesson.order} ${locale}: uploaded`);
      } else {
        console.log(`Lesson ${lesson.order} ${locale}: skipped (db already has url)`);
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
