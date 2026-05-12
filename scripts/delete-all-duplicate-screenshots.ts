// Delete ALL lessons with duplicate screenshots from DB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

// Groups of duplicate screenshots (hash -> lesson orders)
// Keep the FIRST lesson in each group, delete the rest
const DUPLICATE_GROUPS: Map<string, number[]> = new Map([
  ['00820cc58c97204191f39d286df705d7', [12, 16]],
  ['0264ee4acfbc2b8172d4601411f85be5', [7, 8]],
  ['029eb68198afb69540f62890198aa4ae', [6, 7]],
  ['02eed3f807ec3152e97a99890bd0d0b8', [77, 78, 113, 114]],
  ['055d62bd070cad583b9818487b744255', [129, 130, 131, 132, 133, 134, 135, 136]],
  ['09c1f30f846cbf292098581177215972', [88, 89, 129]],
  ['0cf13b0bc21a9dcba8a884cb636aa678', [18, 46, 47, 51, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 84, 85, 86, 87]],
  ['19f21687685fbffc815dcc0c5e0c72f6', [23, 24, 33, 34]],
  ['1cb38e7c4d0fe846e6ebd62334f20a93', [28, 39]],
  ['20f9d11e0de4ccd5cdb08eeb7f3968bb', [9, 10]],
  ['274e180e7fe567a6d3bb3fef66f9e9f4', [22, 32]],
  ['28af56481509b8cca036873c7ecef287', [5, 6]],
  ['32879e537130c98a8c92f44199f15f7e', [108, 158]],
  ['33a6a5e40910597d6e706469121e089f', [148, 149]],
  ['37054e745647b79d44ef9bdd2a09509d', [104, 105, 154, 155]],
  ['395eef28048d86d26a35d43c328f5f87', [44, 61]],
  ['3c0bfb10db1cb7ba3feaa6476a3c741e', [96, 141]],
]);

async function main() {
  // Get all lessons from DB
  const allLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, order: true, ruName: true },
  });

  console.log(`Total lessons in DB: ${allLessons.length}`);

  const toDelete: { id: string; order: number; ruName: string }[] = [];

  for (const [hash, orders] of DUPLICATE_GROUPS) {
    // Sort orders and keep the first one
    const sorted = [...orders].sort((a, b) => a - b);
    const keepFirst = sorted[0];
    const deleteOrders = sorted.slice(1);

    console.log(`\nHash ${hash.substring(0, 8)}...: keep ${keepFirst}, delete ${deleteOrders.join(', ')}`);

    for (const order of deleteOrders) {
      const lesson = allLessons.find(l => l.order === order);
      if (lesson) {
        toDelete.push(lesson);
      }
    }
  }

  console.log(`\n\nTotal lessons to delete: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('No lessons to delete');
    return;
  }

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
    console.log(`Deleted lesson ${lesson.order}: ${lesson.ruName}`);
  }

  const remaining = await prisma.lesson.count();
  console.log(`\nDone! Remaining lessons: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
