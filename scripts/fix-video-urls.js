const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEO_BASE_URL = 'https://github.com/FreedoomForm/genspark/releases/download/lesson-videos/';

// Special naming for lessons 171-173
const specialVideoNames = {
  171: '171-ru-abc.mp4',
  172: '172-ru-xyz.mp4',
  173: '173-ru-abc-xyz.mp4',
};

// Get actual video names from GitHub Releases API
async function getActualVideoNames() {
  const https = require('https');
  const token = process.env.GITHUB_TOKEN;
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/FreedoomForm/genspark/releases',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const releases = JSON.parse(data);
          const assets = releases[0]?.assets || [];
          const videoNames = assets.map(a => a.name);
          resolve(videoNames);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching actual video names from GitHub Releases...');
  const actualVideoNames = await getActualVideoNames();
  console.log(`Found ${actualVideoNames.length} videos on GitHub Releases`);
  
  const lessons = await prisma.$queryRaw`
    SELECT id, "order", "uzName"
    FROM lesson
    ORDER BY "order"
  `;
  
  console.log(`Found ${lessons.length} lessons in database`);
  
  let updated = 0;
  let notFound = [];
  
  for (const lesson of lessons) {
    const order = Number(lesson.order);
    
    // Determine Russian video filename
    let ruVideoName;
    if (specialVideoNames[order]) {
      ruVideoName = specialVideoNames[order];
    } else {
      ruVideoName = `${String(order).padStart(3, '0')}-ru-lesson.mp4`;
    }
    
    // Check if video exists
    const ruExists = actualVideoNames.includes(ruVideoName);
    const videoUrlRu = ruExists ? `${VIDEO_BASE_URL}${ruVideoName}` : null;
    
    // Uzbek video - use slug from uzName (for future generation)
    const uzSlug = lesson.uzName
      ? lesson.uzName
          .toLowerCase()
          .replace(/'/g, '-')
          .replace(/ʼ/g, '-')
          .replace(/'/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : null;
    
    const uzVideoName = uzSlug ? `${String(order).padStart(3, '0')}-uz-${uzSlug}.mp4` : null;
    const uzExists = uzVideoName ? actualVideoNames.includes(uzVideoName) : false;
    const videoUrlUz = uzExists ? `${VIDEO_BASE_URL}${uzVideoName}` : null;
    
    await prisma.$executeRaw`
      UPDATE lesson
      SET "videoUrl" = ${videoUrlRu}, "videoUrlUz" = ${videoUrlUz}
      WHERE id = ${lesson.id}
    `;
    
    updated++;
    
    if (!ruExists) {
      notFound.push(order);
    }
    
    console.log(`Order ${order}: RU=${ruVideoName} (${ruExists ? 'YES' : 'NO'}), UZ=${uzVideoName || 'N/A'} (${uzExists ? 'YES' : 'NO'})`);
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated} lessons`);
  console.log(`Videos not found for orders: ${notFound.join(', ')}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
