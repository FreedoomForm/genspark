// Find lessons with duplicate screenshots in cloud DB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

async function main() {
  // Get lesson 66
  const lesson66 = await prisma.lesson.findFirst({
    where: { order: 66 },
  });

  console.log('Lesson 66:');
  console.log(JSON.stringify(lesson66, null, 2));

  if (!lesson66?.screenshot) {
    console.log('No screenshot for lesson 66');
    return;
  }

  console.log('\nScreenshot URL:', lesson66.screenshot);

  // Find all lessons with same screenshot
  const duplicates = await prisma.lesson.findMany({
    where: {
      screenshot: lesson66.screenshot,
    },
    orderBy: { order: 'asc' },
  });

  console.log(`\nFound ${duplicates.length} lessons with same screenshot:`);
  duplicates.forEach(l => {
    console.log(`  - Lesson ${l.order}: ${l.ruName}`);
  });

  // Get all lessons and group by screenshot
  const allLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, order: true, ruName: true, screenshot: true },
  });

  const screenshotGroups: Map<string, typeof allLessons> = new Map();

  for (const lesson of allLessons) {
    const key = lesson.screenshot || 'null';
    if (!screenshotGroups.has(key)) {
      screenshotGroups.set(key, []);
    }
    screenshotGroups.get(key)!.push(lesson);
  }

  console.log('\n\n=== ALL DUPLICATE GROUPS ===');
  for (const [screenshot, lessons] of screenshotGroups) {
    if (lessons.length > 1) {
      console.log(`\nScreenshot: ${screenshot.substring(0, 80)}...`);
      console.log(`  Count: ${lessons.length}`);
      lessons.forEach(l => console.log(`    - ${l.order}: ${l.ruName}`));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
