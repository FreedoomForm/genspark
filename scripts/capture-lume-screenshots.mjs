import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, 'lessons259');
const OUT_BASE = path.join(ROOT, 'public', 'generated-screenshots', 'lume');
const RAW_DIR = path.join(OUT_BASE, 'raw');
const RELEASE_DIR = path.join(OUT_BASE, 'release');
const MANIFEST_PATH = path.join(OUT_BASE, 'manifest.json');

const BASE_URL = String(process.env.LUME_ADMIN_URL || 'https://admin.lume.uz').replace(/\/+$/, '');
const EMAIL = process.env.LUME_ADMIN_EMAIL || process.env.LUME_LOGIN || '';
const PASSWORD = process.env.LUME_ADMIN_PASSWORD || process.env.LUME_PASSWORD || '';
const FROM = Math.max(1, Number(process.env.FROM || '1'));
const TO = Math.max(FROM, Number(process.env.TO || '183'));
const HEADLESS = !['0', 'false', 'no'].includes(String(process.env.HEADLESS || '1').toLowerCase());
const PAGE_WAIT_MS = Math.max(2500, Number(process.env.PAGE_WAIT_MS || '4500'));
const LOGIN_WAIT_MS = Math.max(3000, Number(process.env.LOGIN_WAIT_MS || '7000'));

for (const dir of [OUT_BASE, RAW_DIR, RELEASE_DIR]) fs.mkdirSync(dir, { recursive: true });

function log(...args) {
  console.log('[capture]', ...args);
}

function warn(...args) {
  console.warn('[capture][warn]', ...args);
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9/_:-]+/g, '-')
    .replace(/\/+/g, '_')
    .replace(/:+/g, '_')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 90) || 'route';
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function routeCategory(route) {
  const s = String(route || '').toLowerCase();
  if (/^\/(dashboard|home|cabinet)\b/.test(s)) return 'cabinet';
  if (/(warehouse|product|receipt|transfer|realiz|reprice|inventor|writeoff|group|barcode|techcard|manufactur|favorite)/.test(s)) return 'warehouse';
  if (/(avatar|client|driver|courier|personal|tag|telegram|contractor|loyalt|shift|subscription|tariff)/.test(s)) return 'reference';
  if (/(finance|account|balance|salary|cashbox|payment|sold-check|return-check)/.test(s)) return 'finance';
  if (/(report|sales|abc|xyz|top|analytics|pl|z-report|movement)/.test(s)) return 'reports';
  return 'settings';
}

function materializeRoute(route, order) {
  const replacements = {
    ':id': '1',
    ':uuid': '11111111-1111-1111-1111-111111111111',
    ':guid': '11111111-1111-1111-1111-111111111111',
    ':slug': 'demo',
    ':name': 'demo',
    ':type': 'all',
    ':code': 'demo',
    ':page': '1',
    ':index': '1',
    ':userId': '1',
    ':lessonId': String(order || 1),
  };

  return String(route || '')
    .replace(/:[A-Za-z0-9_]+/g, (token) => replacements[token] || '1')
    .replace(/\/+/g, '/');
}

function lessonStem(fileName) {
  return String(fileName)
    .replace(/^\d+_/, '')
    .replace(/\.md$/i, '');
}

function parseLessonFile(filePath) {
  const name = path.basename(filePath);
  const txt = fs.readFileSync(filePath, 'utf8');
  const order = Number((name.match(/^(\d+)/) || [])[1] || '0');
  const route = (txt.match(/\*\*Route:\*\*\s*`([^`]+)`/) || [])[1] || '';
  const title = (txt.match(/^#\s+(.+)$/m) || [])[1] || name;
  return {
    order,
    fileName: name,
    stem: lessonStem(name),
    title,
    headingBase: String(title).replace(/^Urok\s+\d+\.\s*/i, '').split('/')[0].trim(),
    rawRoute: route.startsWith('/') ? route : `/${route}`,
  };
}

function loadLessons() {
  // Check if directory exists
  if (!fs.existsSync(LESSONS_DIR)) {
    const cwd = process.cwd();
    const parentDir = path.dirname(LESSONS_DIR);
    const parentContents = fs.existsSync(parentDir) ? fs.readdirSync(parentDir) : [];
    throw new Error(
      `lessons259 directory not found!\n` +
      `  Expected path: ${LESSONS_DIR}\n` +
      `  Current working dir: ${cwd}\n` +
      `  Parent directory (${parentDir}) contents: ${parentContents.slice(0, 20).join(', ')}${parentContents.length > 20 ? '...' : ''}\n` +
      `  Total items in parent: ${parentContents.length}\n` +
      `  Make sure the lessons259 directory is committed to the repository.`
    );
  }

  const files = fs.readdirSync(LESSONS_DIR)
    .filter((f) => /^\d+.*\.md$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'en'));

  log(`Found ${files.length} .md files in lessons259/`);

  return files
    .map((f) => parseLessonFile(path.join(LESSONS_DIR, f)))
    .filter((x) => x.order >= FROM && x.order <= TO && x.rawRoute);
}

async function firstVisible(page, selectors, timeout = 15000) {
  for (const selector of selectors) {
    try {
      const loc = page.locator(selector).first();
      await loc.waitFor({ state: 'visible', timeout });
      return { locator: loc, selector };
    } catch {
      // continue
    }
  }
  return null;
}

async function debugDump(page, label) {
  const base = path.join(OUT_BASE, `debug-${label}`);
  await page.screenshot({ path: `${base}.png`, fullPage: true }).catch(() => {});
  const info = {
    url: page.url(),
    title: await page.title().catch(() => ''),
    bodyText: await page.locator('body').innerText().catch(() => ''),
    html: await page.content().catch(() => ''),
  };
  fs.writeFileSync(`${base}.json`, JSON.stringify(info, null, 2));
}

async function login(page) {
  const emailSelectors = [
    'input[name="email"]',
    'input[type="email"]',
    'input[placeholder*="почт"]',
    'input[placeholder*="email" i]',
  ];
  const passwordSelectors = [
    'input[name="password"]',
    'input[type="password"]',
    'input[placeholder*="парол"]',
    'input[placeholder*="password" i]',
  ];
  const submitSelectors = [
    'button:has-text("Войти")',
    'button:has-text("Kirish")',
    'button[type="submit"]',
  ];

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(LOGIN_WAIT_MS);

  const email = await firstVisible(page, emailSelectors, 20000);
  const password = await firstVisible(page, passwordSelectors, 5000);

  if (!email || !password) {
    await debugDump(page, 'login-missing-fields');
    throw new Error('Не найдены поля email/password. Проверь debug-login-missing-fields.*');
  }

  await email.locator.fill(EMAIL);
  await password.locator.fill(PASSWORD);

  const submit = await firstVisible(page, submitSelectors, 5000);
  if (submit) {
    await submit.locator.click();
  } else {
    await password.locator.press('Enter');
  }

  await page.waitForURL(/\/dashboard|\/(ado|avatars|barcodes|cabinet|warehouse|reports|settings|vendor|salepoint|admin)/, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(LOGIN_WAIT_MS);

  if (/\/login\/?$/.test(page.url())) {
    await debugDump(page, 'login-still-on-login');
    throw new Error('Логин не выполнился: после submit страница осталась на login');
  }

  log('Login OK ->', page.url());
}

async function ensureAuthenticated(page) {
  const hasEmailField = await page.locator('input[name="email"], input[type="email"]').count().catch(() => 0);
  if (hasEmailField) {
    warn('Session seems lost, logging in again...');
    await login(page);
  }
}

async function fetchRouteAliases(page) {
  // Hardcoded route aliases for pages that require specific URL prefixes
  // Many routes in admin.lume.uz require /vendor/ or /admin/ prefix instead of /salepoint/
  const aliases = new Map([
    // Barcodes - vendor routes
    ['barcodes', '/vendor/barcodes/print'],
    ['barcodes_create', '/vendor/barcodes/print'],
    ['barcodes_print', '/vendor/barcodes/print'],
    ['barcodes_edit_id', '/vendor/barcodes/print'],

    // Clients - vendor routes
    ['clients', '/vendor/clients'],
    ['clients_add', '/vendor/clients/add'],
    ['clients_details_id', '/vendor/clients/details/1'],
    ['clients_details_history', '/vendor/clients/details/history'],
    ['clients_loyalty', '/vendor/clients/loyalty'],
    ['clients_loyalty_edit', '/vendor/clients/loyalty/edit'],

    // Couriers - vendor routes
    ['couriers', '/vendor/couriers'],
    ['couriers_add', '/vendor/couriers/add'],
    ['courier_details_id', '/vendor/courier/details/1'],
    ['courier_edit_id', '/vendor/courier/edit/1'],

    // Default IKPU - vendor routes
    ['defaultikpu', '/vendor/defaultikpu'],
    ['defaultikpu_add', '/vendor/defaultikpu/add'],
    ['defaultikpu_edit_id', '/vendor/defaultikpu/edit/1'],

    // Global warehouse - vendor routes
    ['globalwarehouse', '/vendor/globalwarehouse'],
    ['globalwarehouse_add', '/vendor/globalwarehouse/add'],
    ['globalwarehouse_edit_id', '/vendor/globalwarehouse/edit/1'],

    // Licenses - vendor routes
    ['licenses', '/vendor/licenses'],
    ['licenses_connect', '/vendor/licenses/connect'],

    // Main/Dashboard - use dashboard prefix
    ['main', '/dashboard'],
    ['dashboard', '/dashboard'],

    // Material info - vendor route
    ['material_info', '/vendor/material-info'],
    ['material-info', '/vendor/material-info'],

    // Modifications - vendor routes
    ['modifications', '/vendor/modifications'],
    ['modifications_add', '/vendor/modifications/add'],
    ['modifications_edit', '/vendor/modifications/edit'],

    // Operations - vendor routes
    ['operations_import', '/vendor/operations/import'],
    ['operations_import_check', '/vendor/operations/import/check'],
    ['operations_import_details', '/vendor/operations/import/details'],
    ['operations_inventory', '/vendor/operations/inventory'],
    ['operations_inventory_add', '/vendor/operations/inventory/add'],
    ['operations_inventory_details_id', '/vendor/operations/inventory/details/1'],
    ['operations_inventory_edit_id', '/vendor/operations/inventory/edit/1'],
    ['operations_overvaluation', '/vendor/operations/overvaluation'],
    ['operations_overvaluation_create', '/vendor/operations/overvaluation/create'],
    ['operations_overvaluation_details_id', '/vendor/operations/overvaluation/details/1'],
    ['operations_overvaluation_edit_id', '/vendor/operations/overvaluation/edit/1'],
    ['operations_transfer', '/vendor/operations/transfer'],
    ['operations_transfer_add', '/vendor/operations/transfer/add'],
    ['operations_transfer_details_id', '/vendor/operations/transfer/details/1'],
    ['operations_transfer_edit_id', '/vendor/operations/transfer/edit/1'],
    ['operations_transfer_refund', '/vendor/operations/transfer/refund'],

    // Plans - vendor routes
    ['plans', '/vendor/plans'],
    ['plans_add', '/vendor/plans/add'],
    ['plans_edit_id', '/vendor/plans/edit/1'],

    // Prices - vendor routes
    ['prices', '/vendor/prices'],
    ['prices_add', '/vendor/prices/add'],
    ['prices_points', '/vendor/prices/points'],
    ['prices_points_add', '/vendor/prices/points/add'],

    // Products - vendor routes
    ['products', '/vendor/products'],
    ['products_add', '/vendor/products/add'],
    ['products_details_id', '/vendor/products/details/1'],
    ['products_edit_id', '/vendor/products/edit/1'],
    ['products_requests', '/vendor/products/requests'],

    // Product warehouse - vendor route
    ['productwarehouse', '/vendor/productwarehouse'],

    // Recipes - vendor routes
    ['recipes', '/vendor/recipes'],
    ['recipes_add', '/vendor/recipes/add'],
    ['recipes_edit_id', '/vendor/recipes/edit/1'],
  ]);

  try {
    const src = await page.locator('script[type="module"][src]').first().getAttribute('src');
    if (!src) return aliases;
    const bundleUrl = new URL(src, `${BASE_URL}/`).toString();
    const res = await fetch(bundleUrl);
    if (!res.ok) return aliases;
    const text = await res.text();
    const re = /title:"([^"]+)",link:"([^"]+)"/g;
    for (const m of text.matchAll(re)) {
      const key = normalizeKey(m[1]);
      if (key && m[2] && !aliases.has(key)) aliases.set(key, m[2]);
    }
  } catch {
    // ignore alias extraction errors
  }
  return aliases;
}

function buildCandidateUrls(lesson, aliases) {
  const materializedRoute = materializeRoute(lesson.rawRoute, lesson.order);
  const keys = [
    normalizeKey(lesson.stem),
    normalizeKey(lesson.stem.split('__')[0]),
    normalizeKey(materializedRoute.split('/').filter(Boolean)[0] || ''),
    normalizeKey(lesson.headingBase),
  ].filter(Boolean);

  const candidates = [];
  const add = (value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return;
    const absolute = cleaned.startsWith('http')
      ? cleaned
      : new URL(cleaned.replace(/^\/+/, ''), `${BASE_URL}/`).toString();
    if (!candidates.includes(absolute)) candidates.push(absolute);
  };

  for (const key of keys) if (aliases.has(key)) add(aliases.get(key));
  add(materializedRoute);
  add(`/salepoint${materializedRoute}`);
  add(`/vendor${materializedRoute}`);
  add(`/admin${materializedRoute}`);
  add(`/dashboard${materializedRoute}`);

  return { materializedRoute, candidates };
}

function looksLikeDashboard(url, bodyText) {
  const u = String(url || '');
  const text = String(bodyText || '');
  return /\/dashboard\/?$/i.test(u) && /Начало работы|Складские операции|Финансовые операции/.test(text);
}

function isEmptyContent(bodyText) {
  const text = String(bodyText || '').trim();
  // White screen or almost empty page - less than 50 chars means something went wrong
  return text.length < 50;
}

async function openLesson(page, lesson, aliases) {
  const { materializedRoute, candidates } = buildCandidateUrls(lesson, aliases);

  for (const candidate of candidates) {
    await page.goto(candidate, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(PAGE_WAIT_MS);
    await ensureAuthenticated(page);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const currentUrl = page.url();

    // Skip empty/white-screen pages and continue to next candidate
    if (isEmptyContent(bodyText)) {
      warn(`Empty content for ${candidate}, trying next...`);
      continue;
    }

    if (!looksLikeDashboard(currentUrl, bodyText) || /\/dashboard\//.test(currentUrl) || /\/vendor\//.test(currentUrl) || /\/admin\//.test(currentUrl) || /\/salepoint\//.test(currentUrl)) {
      return { materializedRoute, resolvedUrl: currentUrl, bodyText };
    }
  }

  if (lesson.headingBase) {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(2000);
    const target = page.getByText(lesson.headingBase, { exact: true }).first();
    if (await target.count().catch(() => 0)) {
      await target.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(PAGE_WAIT_MS);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      return { materializedRoute, resolvedUrl: page.url(), bodyText };
    }
  }

  return {
    materializedRoute,
    resolvedUrl: page.url(),
    bodyText: await page.locator('body').innerText().catch(() => ''),
  };
}

function displayAssetName(lesson) {
  return `${String(lesson.order).padStart(3, '0')}_${slugify(lesson.stem || lesson.rawRoute)}.png`;
}

function displayTitle(lesson) {
  return String(lesson.title || lesson.fileName).replace(/^Urok\s+\d+\.\s*/i, '').trim();
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('LUME_ADMIN_EMAIL/LUME_ADMIN_PASSWORD are required');
  }

  const lessons = loadLessons();
  log(`Loaded ${lessons.length} lessons in range ${FROM}..${TO}`);
  if (!lessons.length) throw new Error('No lessons found for selected range');

  const browser = await chromium.launch({ headless: HEADLESS, args: ['--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    from: FROM,
    to: TO,
    count: lessons.length,
    entries: [],
  };

  try {
    await login(page);
    const aliases = await fetchRouteAliases(page);
    log(`Loaded route aliases: ${aliases.size}`);

    for (const lesson of lessons) {
      const fileName = displayAssetName(lesson);
      const rawPath = path.join(RAW_DIR, fileName);
      const releasePath = path.join(RELEASE_DIR, fileName);

      log(`#${lesson.order} ${lesson.rawRoute}`);
      let status = 'ok';
      let error = null;
      let resolvedUrl = null;
      let materializedRoute = lesson.rawRoute;
      let bodyText = '';
      try {
        const opened = await openLesson(page, lesson, aliases);
        materializedRoute = opened.materializedRoute;
        resolvedUrl = opened.resolvedUrl;
        bodyText = opened.bodyText || '';
        await page.screenshot({ path: rawPath, fullPage: true });
        fs.copyFileSync(rawPath, releasePath);
      } catch (e) {
        status = 'error';
        error = e instanceof Error ? e.message : String(e);
        warn(`#${lesson.order} failed: ${error}`);
        await page.screenshot({ path: rawPath, fullPage: true }).catch(() => {});
        if (fs.existsSync(rawPath)) fs.copyFileSync(rawPath, releasePath);
      }

      const sha256 = fs.existsSync(rawPath) ? sha256File(rawPath) : null;
      const pageTitle = await page.title().catch(() => '');
      const finalText = bodyText || await page.locator('body').innerText().catch(() => '');
      manifest.entries.push({
        order: lesson.order,
        title: displayTitle(lesson),
        sourceFile: lesson.fileName,
        rawRoute: lesson.rawRoute,
        materializedRoute,
        absoluteUrl: resolvedUrl || new URL(materializedRoute.replace(/^\/+/, ''), `${BASE_URL}/`).toString(),
        fileName,
        assetName: fileName,
        category: routeCategory(lesson.rawRoute),
        status,
        error,
        screenshotSha256: sha256,
        pageTitle,
        textSample: finalText.slice(0, 4000),
      });
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    log(`Manifest saved: ${MANIFEST_PATH}`);
  }
}

main().catch((error) => {
  console.error('[capture] fatal:', error);
  process.exit(1);
});
