// Delete all lessons from database
import { prisma } from '../lib/db';

async function main() {
  console.log('Deleting all lessons...');

  // First delete all lesson progress (due to foreign key constraint)
  const progressDeleted = await prisma.lessonProgress.deleteMany({});
  console.log(`Deleted ${progressDeleted.count} lesson progress records`);

  // Then delete all lessons
  const lessonsDeleted = await prisma.lesson.deleteMany({});
  console.log(`Deleted ${lessonsDeleted.count} lessons`);

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
