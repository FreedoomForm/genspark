const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEO_BASE_URL = 'https://github.com/FreedoomForm/genspark/releases/download/lesson-videos/';

// Function to create slug from Uzbek name
function createUzSlug(uzName) {
  if (!uzName) return null;
  
  return uzName
    .toLowerCase()
    .replace(/'/g, '-')  // Replace apostrophes with hyphens
    .replace(/ʼ/g, '-')  // Replace Uzbek apostrophe
    .replace(/'/g, '-')  // Replace another apostrophe variant
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric characters except hyphens
    .replace(/-+/g, '-')  // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
}

async function main() {
  console.log('Fetching lessons from database...');
  
  const lessons = await prisma.$queryRaw`
    SELECT id, "order", "uzName"
    FROM lesson
    ORDER BY "order"
  `;
  
  console.log(`Found ${lessons.length} lessons`);
  
  let ruUpdated = 0;
  let uzUpdated = 0;
  
  for (const lesson of lessons) {
    const order = Number(lesson.order);
    
    // Russian video URL
    const videoUrlRu = `${VIDEO_BASE_URL}${String(order).padStart(3, '0')}-ru-lesson.mp4`;
    
    // Uzbek video URL
    const uzSlug = createUzSlug(lesson.uzName);
    const videoUrlUz = uzSlug ? `${VIDEO_BASE_URL}${String(order).padStart(3, '0')}-uz-${uzSlug}.mp4` : null;
    
    await prisma.$executeRaw`
      UPDATE lesson
      SET "videoUrl" = ${videoUrlRu}, "videoUrlUz" = ${videoUrlUz}
      WHERE id = ${lesson.id}
    `;
    
    ruUpdated++;
    if (videoUrlUz) uzUpdated++;
    
    console.log(`Order ${order}: ru=${videoUrlRu.split('/').pop()}, uz=${videoUrlUz ? videoUrlUz.split('/').pop() : 'NULL'}`);
  }
  
  console.log(`\nUpdated ${ruUpdated} Russian video URLs`);
  console.log(`Updated ${uzUpdated} Uzbek video URLs`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
