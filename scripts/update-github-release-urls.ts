// Update video URLs to use GitHub Releases
// Run: npx tsx scripts/update-github-release-urls.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const GITHUB_REPO = 'FreedoomForm/genspark';
const RELEASE_VERSION = 'v1.0.0';
const BASE_URL = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_VERSION}`;

async function main() {
  console.log('Updating video URLs to GitHub Releases...');
  console.log(`Base URL: ${BASE_URL}`);

  // Check for video files in public/generated-videos
  const videosDir = path.join(process.cwd(), 'public', 'generated-videos');
  let videoFiles: string[] = [];

  if (fs.existsSync(videosDir)) {
    videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));
    console.log(`Found ${videoFiles.length} video files`);
  }

  const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } });
  console.log(`Updating ${lessons.length} lessons...`);

  let updated = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    const orderStr = String(lesson.order).padStart(3, '0');

    // Find Russian video
    const ruFile = videoFiles.find(f => f === `${orderStr}-ru-lesson.mp4`);
    const ruUrl = ruFile ? `${BASE_URL}/${ruFile}` : null;

    // Find Uzbek video (any file starting with XXX-uz-)
    const uzFile = videoFiles.find(f => f.startsWith(`${orderStr}-uz-`) && f.endsWith('.mp4'));
    const uzUrl = uzFile ? `${BASE_URL}/${uzFile}` : null;

    if (ruUrl || uzUrl) {
      const videoMap: { ru?: string; uz?: string; default?: string } = {};
      if (ruUrl) videoMap.ru = ruUrl;
      if (uzUrl) videoMap.uz = uzUrl;
      videoMap.default = ruUrl || uzUrl || undefined;

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoUrl: JSON.stringify(videoMap) }
      });

      console.log(`✓ Lesson ${lesson.order}: ${lesson.ruName}`);
      console.log(`  RU: ${ruUrl || 'N/A'}`);
      console.log(`  UZ: ${uzUrl || 'N/A'}`);
      updated++;
    } else {
      console.log(`✗ Lesson ${lesson.order}: ${lesson.ruName} - no video file found`);
      skipped++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
