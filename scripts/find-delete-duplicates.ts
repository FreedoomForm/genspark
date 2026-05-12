// Find and delete lessons with duplicate screenshots
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

// MD5 hash of lesson 66 screenshot (duplicates)
const DUPLICATE_HASH = '0cf13b0bc21a9dcba8a884cb636aa678';

// Lessons with this hash (from GitHub release analysis)
const LESSONS_WITH_SAME_SCREENSHOT = [18, 46, 47, 51, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 84, 85, 86, 87];

async function main() {
  // Get all lessons from DB
  const allLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, order: true, ruName: true, screenshot: true },
  });

  console.log(`Total lessons in DB: ${allLessons.length}`);

  // Find lessons that have duplicate screenshots (based on order number)
  const duplicateOrders = LESSONS_WITH_SAME_SCREENSHOT;
  const lessonsToDelete = allLessons.filter(l => duplicateOrders.includes(l.order));

  console.log(`\nLessons with duplicate screenshots (to delete):`);
  lessonsToDelete.forEach(l => {
    console.log(`  - Order ${l.order}: ${l.ruName}`);
    console.log(`    Screenshot: ${l.screenshot}`);
  });

  if (lessonsToDelete.length === 0) {
    console.log('No duplicate lessons found in DB');
    return;
  }

  // Keep only lesson 66, delete others
  const toDelete = lessonsToDelete.filter(l => l.order !== 66);

  if (toDelete.length === 0) {
    console.log('\nAll duplicate lessons are lesson 66 itself - nothing to delete');
    return;
  }

  console.log(`\nWill delete ${toDelete.length} lessons (keeping lesson 66):`);
  toDelete.forEach(l => console.log(`  - Order ${l.order}: ${l.ruName}`));

  // Delete lessons
  for (const lesson of toDelete) {
    // First delete progress records
    await prisma.lessonProgress.deleteMany({
      where: { lessonId: lesson.id },
    });

    // Then delete lesson
    await prisma.lesson.delete({
      where: { id: lesson.id },
    });
    console.log(`Deleted lesson ${lesson.order}`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
