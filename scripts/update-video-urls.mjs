import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'lesson';
}

function parseVideoMap(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
  } catch {}
  return {};
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
  });

  console.log(`Found ${lessons.length} lessons`);

  for (const lesson of lessons) {
    const map = parseVideoMap(lesson.videoUrl);
    let updated = false;

    // Check for Russian video
    const ruBase = `${String(lesson.order).padStart(3, '0')}-ru-lesson`;
    const ruPath = `/generated-videos/${ruBase}.mp4`;
    const ruFile = path.join(OUT_DIR, `${ruBase}.mp4`);
    
    if (fs.existsSync(ruFile) && map.ru !== ruPath) {
      map.ru = ruPath;
      updated = true;
      console.log(`Lesson ${lesson.order} ru: ${ruPath}`);
    }

    // Check for Uzbek video
    const uzBase = `${String(lesson.order).padStart(3, '0')}-uz-${slugify(lesson.uzName)}`;
    const uzPath = `/generated-videos/${uzBase}.mp4`;
    const uzFile = path.join(OUT_DIR, `${uzBase}.mp4`);
    
    if (fs.existsSync(uzFile) && map.uz !== uzPath) {
      map.uz = uzPath;
      updated = true;
      console.log(`Lesson ${lesson.order} uz: ${uzPath}`);
    }

    if (updated) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoUrl: JSON.stringify(map) },
      });
      console.log(`Lesson ${lesson.order}: updated`);
    }
  }

  console.log('Done!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
