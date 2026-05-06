import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(ROOT, 'public', 'generated-videos');
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.VIDEO_RELEASE_TAG || 'lesson-videos';
const BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;

async function main() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    throw new Error(`Video directory not found: ${VIDEOS_DIR}`);
  }

  const files = fs.readdirSync(VIDEOS_DIR).filter((file) => file.endsWith('.mp4')).sort();
  const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } });

  let updated = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    const orderStr = String(lesson.order).padStart(3, '0');
    const ruFile = files.find((file) => file.startsWith(`${orderStr}-ru-`) && file.endsWith('.mp4')) || null;
    const uzFile = files.find((file) => file.startsWith(`${orderStr}-uz-`) && file.endsWith('.mp4')) || null;

    if (!ruFile && !uzFile) {
      skipped += 1;
      continue;
    }

    const videoMap = {
      ru: ruFile ? `${BASE_URL}/${encodeURIComponent(ruFile)}` : null,
      uz: uzFile ? `${BASE_URL}/${encodeURIComponent(uzFile)}` : null,
      default: ruFile ? `${BASE_URL}/${encodeURIComponent(ruFile)}` : (uzFile ? `${BASE_URL}/${encodeURIComponent(uzFile)}` : null),
    };

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        videoUrl: JSON.stringify(videoMap),
        updatedAt: new Date(),
      },
    });

    updated += 1;
    console.log(`✓ lesson ${lesson.order}: ${lesson.ruName}`);
  }

  console.log(`Video URL sync complete. Updated=${updated}, Skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
