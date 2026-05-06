// scripts/describe-screenshots-pixtral.mjs
//
// По одному отправляет скриншоты из public/generated-screenshots/lume/release/
// в Mistral Pixtral (pixtral-12b-2409), получает JSON с текстами уроков на ru+uz
// и пишет результат в Postgres (Prisma -> модель Lesson).
//
// Полагается на manifest.json, который сделал scripts/capture-lume-screenshots.mjs:
//   { entries: [ { order, rawRoute, materializedRoute, absoluteUrl, fileName, assetName, ... } ] }
//
// ENV:
//   MISTRAL_API_KEY  - ключ Mistral (обязательно)
//   PIXTRAL_MODEL    - по умолчанию pixtral-12b-2409
//   GITHUB_REPOSITORY - owner/repo (по умолчанию FreedoomForm/genspark)
//   SCREENSHOT_RELEASE_TAG - по умолчанию lume-screenshots
//   DATABASE_URL     - Postgres (Neon)
//   FROM, TO         - диапазон уроков (по умолчанию 1..259)
//   FORCE            - 1 = переписать даже уже описанные уроки
//   PIXTRAL_CONCURRENCY - сколько параллельных запросов в Pixtral (по умолчанию 1)
//   PIXTRAL_RETRY    - сколько попыток на запрос (по умолчанию 3)

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();

const MANIFEST_FILE = process.env.SCREENSHOT_MANIFEST
  || path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'manifest.json');
const RELEASE_DIR = process.env.SCREENSHOT_RELEASE_DIR
  || path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'release');
const RAW_DIR = process.env.SCREENSHOT_RAW_DIR
  || path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'raw');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const PIXTRAL_MODEL = process.env.PIXTRAL_MODEL || 'pixtral-12b-2409';
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.SCREENSHOT_RELEASE_TAG || 'lume-screenshots';
const SCREENSHOT_BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;

const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '259');
const FORCE = process.env.FORCE === '1';
const CONCURRENCY = Math.max(1, Number(process.env.PIXTRAL_CONCURRENCY || '1'));
const RETRIES = Math.max(1, Number(process.env.PIXTRAL_RETRY || '3'));

function log(...a) { console.log('[pixtral]', ...a); }
function warn(...a) { console.warn('[pixtral][warn]', ...a); }

function categoryFromRoute(route) {
  const seg = String(route || '').replace(/^\/+(dashboard\/?)?/, '').split('/')[0] || 'general';
  const s = seg.toLowerCase();
  if (['cabinet', 'home', 'dashboard'].some(k => s.includes(k))) return 'cabinet';
  if (['warehouse', 'product', 'receipt', 'transfer', 'realiz', 'reprice', 'inventor', 'writeoff', 'group', 'globalwarehouse', 'techcard', 'manufactur', 'barcode'].some(k => s.includes(k))) return 'warehouse';
  if (['client', 'courier', 'driver', 'personal', 'tag', 'telegram', 'loyalt', 'contractor', 'avatar', 'favorite'].some(k => s.includes(k))) return 'reference';
  if (['finance', 'account', 'balance', 'salary', 'paymentvoucher', 'cashbox'].some(k => s.includes(k))) return 'finance';
  if (['report', 'sales', 'abc', 'top', 'pl', 'analytics'].some(k => s.includes(k))) return 'reports';
  if (['setting', 'interface', 'device', 'param', 'sms', 'edo', 'doc', 'marking', 'promo', 'pricing', 'check', 'subscription', 'tariff', 'license'].some(k => s.includes(k))) return 'settings';
  return 'cabinet';
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) {
    throw new Error(`Manifest not found: ${MANIFEST_FILE}. Run scripts/capture-lume-screenshots.mjs first.`);
  }
  const raw = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const entries = Array.isArray(raw.entries) ? raw.entries : [];
  return entries.filter(e => e.order >= FROM && e.order <= TO);
}

function readMdFallback(order) {
  // Попробуем взять заголовок/контекст из lessons259/NNN_*.md, если он есть
  try {
    const dir = path.join(ROOT, 'lessons259');
    if (!fs.existsSync(dir)) return null;
    const prefix = String(order).padStart(3, '0') + '_';
    const file = fs.readdirSync(dir).find(f => f.startsWith(prefix) && f.endsWith('.md'));
    if (!file) return null;
    return fs.readFileSync(path.join(dir, file), 'utf8');
  } catch {
    return null;
  }
}

function pickImagePath(entry) {
  // Используем уникальный (release) ассет, к которому относится этот entry
  const assetName = entry.assetName || entry.fileName;
  const releasePath = path.join(RELEASE_DIR, assetName);
  if (fs.existsSync(releasePath)) return releasePath;
  const rawPath = path.join(RAW_DIR, entry.fileName);
  if (fs.existsSync(rawPath)) return rawPath;
  return null;
}

async function callPixtral(localImagePath, entry, mdContext) {
  const buf = fs.readFileSync(localImagePath);
  const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  const system = 'Ты опытный методист, описывающий разделы CRM/админ-панели Lume по скриншотам. '
    + 'Отвечай строго JSON, без markdown-кодоблоков и комментариев вне JSON.';

  const userText = [
    `На скриншоте — страница admin.lume.uz по адресу ${entry.absoluteUrl} (route ${entry.materializedRoute || entry.rawRoute}).`,
    `Это урок №${entry.order} в учебной программе.`,
    mdContext ? `Контекст из репозитория (можно использовать для подсказки):\n${mdContext.slice(0, 1500)}` : '',
    'Сгенерируй обучающий материал на русском И на узбекском (latin) по тому, что видно на скриншоте.',
    'Верни строго JSON со схемой:',
    '{',
    '  "ruName": "название раздела на ru, 4–8 слов",',
    '  "uzName": "nomi uz (latin), 4–8 ta soz",',
    '  "ruDescription": "1–2 предложения, что это за раздел",',
    '  "uzDescription": "1–2 jumla",',
    '  "ruFunctionality": "что можно делать на этой странице, 2–4 предложения",',
    '  "uzFunctionality": "2–4 jumla",',
    '  "ruSteps": ["шаг 1", "шаг 2", "шаг 3", "шаг 4", "шаг 5"],',
    '  "uzSteps": ["qadam 1","qadam 2","qadam 3","qadam 4","qadam 5"],',
    '  "ruTips": "1–2 практических совета",',
    '  "uzTips": "1–2 maslahat",',
    '  "ruUseCase": "когда обычно открывают эту страницу",',
    '  "uzUseCase": "qachon ochiladi",',
    '  "uiLocation": "путь в интерфейсе, например: Левое меню → Финансы → Счета"',
    '}',
    'Опирайся ТОЛЬКО на то, что реально видно: заголовки, кнопки, столбцы таблицы, фильтры. Без выдумок.',
  ].filter(Boolean).join('\n');

  const body = {
    model: PIXTRAL_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: dataUrl },
        ],
      },
    ],
  };

  let lastErr = null;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Pixtral retryable ${res.status}: ${txt.slice(0, 200)}`);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Pixtral ${res.status}: ${txt.slice(0, 300)}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '{}';
      try {
        return JSON.parse(content);
      } catch {
        const m = /\{[\s\S]*\}/.exec(content);
        return m ? JSON.parse(m[0]) : {};
      }
    } catch (err) {
      lastErr = err;
      const wait = 1500 * attempt;
      warn(`attempt ${attempt} for #${entry.order} failed: ${err.message}. Retry in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr || new Error('Pixtral failed');
}

function pickSteps(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;
    return JSON.stringify(s.split(/\n+|;\s+/).filter(Boolean));
  }
  return JSON.stringify([String(value)]);
}

function buildScreenshotUrl(entry) {
  const assetName = entry.assetName || entry.fileName;
  if (!assetName) return null;
  return `${SCREENSHOT_BASE_URL}/${encodeURIComponent(assetName)}`;
}

async function alreadyDescribed(order) {
  const existing = await prisma.lesson.findFirst({ where: { order } });
  if (!existing) return false;
  return Boolean(existing.screenshot && existing.ruName && existing.ruDescription && existing.ruSteps);
}

async function upsertLesson(entry, desc) {
  const screenshotUrl = buildScreenshotUrl(entry);
  const data = {
    order: entry.order,
    category: categoryFromRoute(entry.rawRoute || entry.materializedRoute || ''),
    screenshot: screenshotUrl,
    ruName: desc.ruName || `Урок ${entry.order}`,
    uzName: desc.uzName || `Dars ${entry.order}`,
    ruDescription: desc.ruDescription || null,
    uzDescription: desc.uzDescription || null,
    ruFunctionality: desc.ruFunctionality || null,
    uzFunctionality: desc.uzFunctionality || null,
    ruSteps: pickSteps(desc.ruSteps),
    uzSteps: pickSteps(desc.uzSteps),
    ruTips: desc.ruTips || null,
    uzTips: desc.uzTips || null,
    ruUseCase: desc.ruUseCase || null,
    uzUseCase: desc.uzUseCase || null,
    uiLocation: desc.uiLocation || null,
    updatedAt: new Date(),
  };

  const existing = await prisma.lesson.findFirst({ where: { order: entry.order } });
  if (existing) {
    return prisma.lesson.update({ where: { id: existing.id }, data });
  }
  return prisma.lesson.create({ data });
}

async function processOne(entry) {
  const tag = `[${entry.order}] ${entry.materializedRoute || entry.rawRoute}`;

  if (!FORCE && await alreadyDescribed(entry.order)) {
    log(`${tag} already described, skip`);
    return { status: 'skipped' };
  }

  const imgPath = pickImagePath(entry);
  if (!imgPath) {
    warn(`${tag} no image found (assetName=${entry.assetName})`);
    return { status: 'no-image' };
  }

  const md = readMdFallback(entry.order);
  let desc = {};
  try {
    desc = await callPixtral(imgPath, entry, md);
  } catch (e) {
    warn(`${tag} Pixtral failed permanently: ${e.message}`);
  }

  await upsertLesson(entry, desc);
  log(`${tag} OK -> "${desc.ruName || ''}"`);
  return { status: 'ok' };
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = [];
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      try {
        results[i] = await worker(items[i]);
      } catch (e) {
        results[i] = { status: 'error', error: e.message };
      }
    }
  }
  const runners = Array.from({ length: concurrency }, () => next());
  await Promise.all(runners);
  return results;
}

async function main() {
  if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY is empty');

  const entries = loadManifest();
  log(`Loaded ${entries.length} manifest entries (range ${FROM}..${TO})`);

  // Дедупликация: если несколько entries указывают на один и тот же assetName,
  // мы всё равно описываем каждый урок отдельно (route разный), но используем общую картинку.
  const results = await runWithConcurrency(entries, processOne, CONCURRENCY);

  const counts = results.reduce((acc, r) => {
    const k = r?.status || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  log('Summary:', counts);
}

main()
  .catch((e) => {
    console.error('[pixtral] fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
