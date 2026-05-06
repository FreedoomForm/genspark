import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const MANIFEST_FILE = process.env.SCREENSHOT_MANIFEST || path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'manifest.json');
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const RELEASE_TAG = process.env.SCREENSHOT_RELEASE_TAG || 'lume-screenshots';
const BASE_URL = `https://github.com/${REPOSITORY}/releases/download/${RELEASE_TAG}`;

function toAssetUrl(fileName) {
  return `${BASE_URL}/${encodeURIComponent(fileName)}`;
}

async function main() {
  if (!fs.existsSync(MANIFEST_FILE)) {
    throw new Error(`Manifest file not found: ${MANIFEST_FILE}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];

  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.assetName) {
      skipped += 1;
      continue;
    }

    const screenshotUrl = toAssetUrl(entry.assetName);
    const result = await prisma.lesson.updateMany({
      where: { order: entry.order },
      data: {
        screenshot: screenshotUrl,
        updatedAt: new Date(),
      },
    });

    if (result.count > 0) {
      updated += result.count;
      console.log(`✓ lesson order=${entry.order} -> ${screenshotUrl}`);
    } else {
      skipped += 1;
      console.log(`- no lesson row for order=${entry.order}`);
    }
  }

  console.log(`Screenshot URL sync complete. Updated=${updated}, Skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
