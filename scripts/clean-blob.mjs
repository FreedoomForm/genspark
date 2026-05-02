import 'dotenv/config';
import { list, del } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN not set');
  process.exit(1);
}

async function cleanBlob() {
  console.log('Listing all files in Vercel Blob...\n');
  
  let cursor;
  let totalFiles = 0;
  let deletedFiles = 0;
  let keptFiles = 0;
  const toDelete = [];
  
  do {
    const result = await list({ 
      token: BLOB_TOKEN,
      cursor,
      limit: 1000 
    });
    
    cursor = result.cursor;
    
    for (const blob of result.blobs) {
      totalFiles++;
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      
      // Delete ALL files to free space for new optimized videos
      toDelete.push(blob);
      console.log(`❌ DELETE: ${blob.pathname} (${sizeMB} MB)`);
    }
  } while (cursor);
  
  console.log(`\n=== Summary ===`);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Files to delete: ${toDelete.length}`);
  
  if (toDelete.length === 0) {
    console.log('\nNo files to delete. Done!');
    return;
  }
  
  console.log('\nDeleting old files...\n');
  
  for (const blob of toDelete) {
    try {
      await del(blob.url, { token: BLOB_TOKEN });
      deletedFiles++;
      console.log(`✅ Deleted: ${blob.pathname}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${blob.pathname}: ${error.message}`);
    }
  }
  
  console.log(`\n=== Final Summary ===`);
  console.log(`Deleted: ${deletedFiles}`);
  console.log(`Freed space for new optimized videos!`);
}

cleanBlob().catch(console.error);
