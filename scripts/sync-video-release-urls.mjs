import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const VIDEOS_DIR = path.join(ROOT, 'public', 'generated-videos');
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.VIDEO_RELEASE_TAG || 'lesson-videos';
const BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;

function parseVideoFile(fileName) {
  const m = /^(\d+)-(ru|uz)-(.+)\.mp4$/i.exec(fileName);
  if (!m) return null;
  return { order: Number(m[1]), locale: m[2].toLowerCase(), fileName };
}

async function main() {
  if (!fs.existsSync(VIDEOS_DIR)) throw new Error(`Videos dir not found: ${VIDEOS_DIR}`);
  const files = fs.readdirSync(VIDEOS_DIR).filter((f) => f.endsWith('.mp4'));
  const parsed = files.map(parseVideoFile).filter(Boolean);
  const byOrder = new Map();

  for (const item of parsed) {
    const current = byOrder.get(item.order) || {};
    current[item.locale] = `${BASE_URL}/${encodeURIComponent(item.fileName)}`;
    current.default = current.ru || current.uz || null;
    byOrder.set(item.order, current);
  }

  let updated = 0;
  for (const [order, map] of byOrder.entries()) {
    const lesson = await prisma.lesson.findFirst({ where: { order } });
    if (!lesson) continue;
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoUrl: JSON.stringify(map), updatedAt: new Date() },
    });
    updated += 1;
  }

  console.log(`[sync-videos] parsed=${parsed.length} lessonsUpdated=${updated}`);
}

main()
  .catch((error) => {
    console.error('[sync-videos] fatal:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
