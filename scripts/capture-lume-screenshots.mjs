import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE_URL = (process.env.LUME_ADMIN_URL || 'https://admin.lume.uz').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated-screenshots', 'lume');
const RAW_DIR = path.join(OUTPUT_DIR, 'raw');
const RELEASE_DIR = path.join(OUTPUT_DIR, 'release');
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');
const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '259');
const HEADLESS = process.env.HEADLESS !== '0';

for (const dir of [OUTPUT_DIR, RAW_DIR, RELEASE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 90) || 'route';
}

function sha256Buffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256Text(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function fileSha256(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function normalizeRoute(route) {
  const clean = String(route || '').trim();
  if (!clean) return null;
  if (clean === '/') return '/dashboard';
  if (clean === '/dashboard') return '/dashboard';
  return clean.startsWith('/dashboard') ? clean : `/dashboard${clean}`;
}

function materializeDynamicSegments(route) {
  return route.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, key) => {
    const lower = key.toLowerCase();
    if (lower.includes('id')) return '1';
    if (lower.includes('name')) return 'sample';
    if (lower.includes('type')) return 'default';
    if (lower.includes('param')) return 'value';
    return 'sample';
  });
}

function buildFileName(order, originalRoute) {
  return `${String(order).padStart(3, '0')}_${slugify(originalRoute.replace(/^\//, ''))}.png`;
}

function normalizeAssetUrl(assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${BASE_URL}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

function isLikelyRoute(value) {
  return Boolean(
    value &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/assets') &&
    !value.startsWith('/api') &&
    !value.includes('http') &&
    !value.includes('*') &&
    !/\.(css|js|map|png|jpe?g|svg|gif|webp|ico|woff2?|ttf|json)$/i.test(value) &&
    value.length <= 120
  );
}

function collectRoutes(source, pattern) {
  const routes = new Set();
  for (const match of source.matchAll(pattern)) {
    const route = match[1]?.trim();
    if (isLikelyRoute(route)) routes.add(route);
  }
  return routes;
}

function extractRoutesFromBundle(source) {
  const primary = collectRoutes(source, /path:\s*["'`]([^"'`]+)["'`]/g);
  const fallback = collectRoutes(source, /["'`](\/[a-zA-Z0-9_\-/:]+)["'`]/g);
  const routes = primary.size >= 200 ? primary : new Set([...primary, ...fallback]);

  return [...routes]
    .filter((route) => route !== '/login')
    .sort((a, b) => a.localeCompare(b));
}

async function findBundleUrl(page) {
  const html = await page.content();
  const match = html.match(/<script[^>]+src=["']([^"']*\/assets\/index-[^"']+\.js[^"']*)["']/i);
  if (!match?.[1]) {
    throw new Error('Не удалось найти основной JS bundle после входа');
  }
  return normalizeAssetUrl(match[1]);
}

async function login(page) {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);

  const emailSelectors = ['#email', 'input[type="email"]', 'input[name="email"]'];
  const passwordSelectors = ['#password', 'input[type="password"]', 'input[name="password"]'];

  let emailFilled = false;
  for (const selector of emailSelectors) {
    if (await page.locator(selector).count()) {
      await page.locator(selector).first().fill(process.env.LUME_ADMIN_EMAIL || '');
      emailFilled = true;
      break;
    }
  }

  let passwordFilled = false;
  for (const selector of passwordSelectors) {
    if (await page.locator(selector).count()) {
      await page.locator(selector).first().fill(process.env.LUME_ADMIN_PASSWORD || '');
      passwordFilled = true;
      break;
    }
  }

  if (!emailFilled || !passwordFilled) {
    throw new Error('Не найдены поля email/password');
  }

  await Promise.all([
    page.waitForURL(/\/dashboard/i, { timeout: 60000 }),
    page.locator('button[type="submit"]').first().click(),
  ]);

  await page.waitForTimeout(2500);
}

async function waitForStableUi(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForFunction(() => !!document.body && document.body.innerText.trim().length > 200, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

async function main() {
  if (!process.env.LUME_ADMIN_EMAIL || !process.env.LUME_ADMIN_PASSWORD) {
    throw new Error('Нужно передать LUME_ADMIN_EMAIL и LUME_ADMIN_PASSWORD через GitHub Secrets');
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    locale: 'ru-RU',
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  const seenHashes = new Map();
  const duplicateGroups = new Map();

  try {
    await login(page);
    const bundleUrl = await findBundleUrl(page);
    const bundleSource = await page.evaluate(async (url) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error(`bundle fetch failed: ${response.status}`);
      return response.text();
    }, bundleUrl);

    const extractedRoutes = extractRoutesFromBundle(bundleSource);
    if (extractedRoutes.length < 200) {
      throw new Error(`Из bundle извлечено слишком мало роутов: ${extractedRoutes.length}`);
    }

    const selectedRoutes = extractedRoutes.slice(FROM - 1, TO);
    const entries = [];

    for (let index = 0; index < selectedRoutes.length; index += 1) {
      const order = FROM + index;
      const rawRoute = selectedRoutes[index];
      const routeWithDashboard = normalizeRoute(rawRoute);
      const materializedRoute = materializeDynamicSegments(routeWithDashboard);
      const absoluteUrl = `${BASE_URL}${materializedRoute}`;
      const fileName = buildFileName(order, rawRoute);
      const rawFile = path.join(RAW_DIR, fileName);

      let status = 'ok';
      let error = null;

      try {
        await page.goto(absoluteUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await waitForStableUi(page);
        await page.screenshot({ path: rawFile, fullPage: true });
      } catch (captureError) {
        status = 'error';
        error = captureError instanceof Error ? captureError.message : String(captureError);
        await page.screenshot({ path: rawFile, fullPage: true }).catch(() => {});
      }

      const text = await page.locator('body').innerText().catch(() => '');
      const screenshotHash = fs.existsSync(rawFile) ? fileSha256(rawFile) : null;
      const textHash = sha256Text(text);

      let assetName = null;
      let duplicateOf = null;
      if (screenshotHash && fs.existsSync(rawFile)) {
        if (!seenHashes.has(screenshotHash)) {
          assetName = fileName;
          seenHashes.set(screenshotHash, assetName);
          fs.copyFileSync(rawFile, path.join(RELEASE_DIR, assetName));
          duplicateGroups.set(assetName, [fileName]);
        } else {
          assetName = seenHashes.get(screenshotHash);
          duplicateOf = assetName;
          duplicateGroups.get(assetName)?.push(fileName);
        }
      }

      entries.push({
        order,
        rawRoute,
        routeWithDashboard,
        materializedRoute,
        absoluteUrl,
        fileName,
        assetName,
        duplicateOf,
        screenshotHash,
        textHash,
        textLength: text.length,
        status,
        error,
      });

      console.log(`${String(order).padStart(3, '0')} ${status.toUpperCase()} ${materializedRoute} ${assetName ? `-> ${assetName}` : ''}`);
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      bundleUrl,
      from: FROM,
      to: TO,
      extractedRoutesCount: extractedRoutes.length,
      selectedRoutesCount: selectedRoutes.length,
      uniqueAssetsCount: seenHashes.size,
      duplicateGroups: Object.fromEntries(duplicateGroups.entries()),
      entries,
    };

    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Manifest saved to ${MANIFEST_FILE}`);
    console.log(`Unique assets: ${seenHashes.size}`);
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
