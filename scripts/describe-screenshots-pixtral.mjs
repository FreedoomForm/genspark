// scripts/describe-screenshots-pixtral.mjs
//
// По одному отправляет каждый скриншот из public/generated-screenshots/lume/release/
// в Mistral Pixtral (pixtral-12b-2409) и просит ТОЛЬКО краткое описание раздела (tasnif)
// на русском. Без steps/tips/use-case и без uz-перевода.
//
// Пишет в Neon Postgres (через Prisma) только три поля у lesson:
//   - screenshot   = публичный URL PNG из GitHub release `lume-screenshots`
//   - ruName       = короткое название раздела
//   - ruDescription = описание (tasnif) на русском
//
// uz/videoUrl и т.д. — не трогаем (uz можно заполнить отдельно, видео пишет другой скрипт).
//
// ENV:
//   MISTRAL_API_KEY        - ключ Mistral (обязательно)
//   PIXTRAL_MODEL          - по умолчанию pixtral-12b-2409
//   GITHUB_REPOSITORY      - owner/repo (по умолчанию FreedoomForm/genspark)
//   SCREENSHOT_RELEASE_TAG - по умолчанию lume-screenshots
//   DATABASE_URL           - Neon Postgres
//   FROM, TO               - диапазон уроков (по умолчанию 1..259)
//   FORCE                  - 1 = переписать даже уже описанные уроки
//   PIXTRAL_CONCURRENCY    - параллельность Pixtral-запросов (по умолчанию 2)
//   PIXTRAL_RETRY          - попыток на запрос (по умолчанию 3)

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
const CONCURRENCY = Math.max(1, Number(process.env.PIXTRAL_CONCURRENCY || '2'));
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

function pickImagePath(entry) {
  const assetName = entry.assetName || entry.fileName;
  if (assetName) {
    const releasePath = path.join(RELEASE_DIR, assetName);
    if (fs.existsSync(releasePath)) return releasePath;
  }
  const rawPath = path.join(RAW_DIR, entry.fileName);
  if (fs.existsSync(rawPath)) return rawPath;
  return null;
}

function buildScreenshotUrl(entry) {
  const assetName = entry.assetName || entry.fileName;
  if (!assetName) return null;
  return `${SCREENSHOT_BASE_URL}/${encodeURIComponent(assetName)}`;
}

async function callPixtral(localImagePath, entry) {
  const buf = fs.readFileSync(localImagePath);
  const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  const system = 'Ты эксперт по CRM/админ-панели Lume. Опиши страницу по скриншоту. '
    + 'Отвечай строго JSON, без markdown-кодоблоков и текста вне JSON.';

  const userText = [
    `Скриншот страницы admin.lume.uz по адресу ${entry.absoluteUrl} (route ${entry.materializedRoute || entry.rawRoute}).`,
    'Верни строго JSON только из двух полей на русском языке:',
    '{',
    '  "ruName": "короткое название раздела (4–8 слов)",',
    '  "ruDescription": "описание раздела (2–5 предложений): что это за страница и для чего она нужна. Опирайся только на то, что видно на скриншоте — заголовки, кнопки, столбцы таблицы. Без выдумок."',
    '}',
    'Никаких других полей в ответе быть не должно.',
  ].join('\n');

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

function defaultRuName(entry) {
  const r = String(entry.materializedRoute || entry.rawRoute || '')
    .replace(/^\/+(dashboard\/?)?/, '')
    .replace(/\//g, ' / ')
    .replace(/[_\-]+/g, ' ')
    .trim();
  return r ? `Раздел ${r}` : `Урок ${entry.order}`;
}

async function alreadyDescribed(order) {
  const existing = await prisma.lesson.findFirst({ where: { order } });
  if (!existing) return false;
  return Boolean(
    existing.screenshot &&
    existing.ruName &&
    existing.ruDescription &&
    existing.ruDescription.length > 30
  );
}

async function upsertLesson(entry, desc) {
  const screenshotUrl = buildScreenshotUrl(entry);
  const ruName = (desc.ruName && String(desc.ruName).trim()) || defaultRuName(entry);
  const ruDescription = (desc.ruDescription && String(desc.ruDescription).trim()) || null;

  const data = {
    order: entry.order,
    category: categoryFromRoute(entry.rawRoute || entry.materializedRoute || ''),
    screenshot: screenshotUrl,
    ruName,
    ruDescription,
    // uz пока заполняем тем же ruName, чтобы NOT NULL не падал в случае seed-схемы
    uzName: ruName,
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

  let desc = {};
  try {
    desc = await callPixtral(imgPath, entry);
  } catch (e) {
    warn(`${tag} Pixtral failed permanently: ${e.message}`);
  }

  await upsertLesson(entry, desc);
  log(`${tag} OK -> "${(desc.ruName || '').slice(0, 60)}"`);
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
