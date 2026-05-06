import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const MANIFEST_PATH = process.env.SCREENSHOT_MANIFEST || path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'manifest.json');
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.SCREENSHOT_RELEASE_TAG || 'lume-screenshots';
const BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;

function screenshotUrl(assetName) {
  return `${BASE_URL}/${encodeURIComponent(assetName)}`;
}

function defaultNames(entry) {
  const routeText = String(entry.rawRoute || entry.materializedRoute || '')
    .replace(/^\/+/, '')
    .replace(/\//g, ' / ')
    .replace(/[_-]+/g, ' ')
    .trim();
  const name = routeText ? `Раздел ${routeText}` : `Урок ${entry.order}`;
  return { ruName: name, uzName: name };
}

async function upsertLesson(entry) {
  const existing = await prisma.lesson.findFirst({ where: { order: entry.order } });
  const names = defaultNames(entry);
  const data = {
    order: entry.order,
    category: entry.category || 'settings',
    screenshot: screenshotUrl(entry.assetName || entry.fileName),
    ruName: existing?.ruName || names.ruName,
    uzName: existing?.uzName || names.uzName,
    updatedAt: new Date(),
  };

  if (existing) {
    await prisma.lesson.update({ where: { id: existing.id }, data });
    return 'updated';
  }

  await prisma.lesson.create({ data });
  return 'created';
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];

  let updated = 0;
  let created = 0;
  for (const entry of entries) {
    if (!entry.assetName && !entry.fileName) continue;
    const status = await upsertLesson(entry);
    if (status === 'updated') updated += 1;
    if (status === 'created') created += 1;
  }

  console.log(`[sync-screenshots] created=${created} updated=${updated} total=${entries.length}`);
}

main()
  .catch((error) => {
    console.error('[sync-screenshots] fatal:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
