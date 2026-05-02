import 'dotenv/config';
import { list, del } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function cleanOldVideos() {
  console.log('Listing files...\n');

  const result = await list({ token: BLOB_TOKEN, limit: 1000 });

  // Delete videos larger than 5 MB (old format)
  const toDelete = result.blobs.filter(blob => {
    const sizeMB = blob.size / 1024 / 1024;
    return sizeMB > 5;
  });

  console.log(`Found ${toDelete.length} old large videos to delete\n`);

  let deleted = 0;
  let freedSpace = 0;

  for (const blob of toDelete) {
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    try {
      await del(blob.url, { token: BLOB_TOKEN });
      deleted++;
      freedSpace += blob.size;
      console.log(`✅ Deleted: ${blob.pathname} (${sizeMB} MB)`);
    } catch (error) {
      console.log(`❌ Failed: ${blob.pathname}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Deleted: ${deleted} files`);
  console.log(`Freed: ${(freedSpace / 1024 / 1024).toFixed(2)} MB`);

  // Show remaining
  const remaining = result.blobs.filter(b => b.size / 1024 / 1024 <= 5);
  const remainingSize = remaining.reduce((sum, b) => sum + b.size, 0);
  console.log(`Remaining: ${remaining.length} files (${(remainingSize / 1024 / 1024).toFixed(2)} MB)`);
}

cleanOldVideos().catch(console.error);
