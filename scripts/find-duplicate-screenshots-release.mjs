// Download all screenshots from GitHub release and find duplicates
import { createHash } from 'crypto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import https from 'https';

const RELEASE_URL = 'https://github.com/FreedoomForm/genspark/releases/download/lume-screenshots/';
const TEMP_DIR = '/tmp/all-screenshots';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (resp) => {
          resp.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }
    }).on('error', reject);
  });
}

async function getFileHash(filepath) {
  const content = await readFile(filepath);
  return createHash('md5').update(content).digest('hex');
}

async function main() {
  // Create temp dir
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }

  // Get list of files from release API
  console.log('Fetching release assets...');
  const response = await fetch('https://api.github.com/repos/FreedoomForm/genspark/releases/tags/lume-screenshots');
  const release = await response.json();
  
  const assets = release.assets.filter(a => a.name.endsWith('.png'));
  console.log(`Found ${assets.length} PNG files`);

  // Download all files
  console.log('Downloading files...');
  let downloaded = 0;
  for (const asset of assets) {
    const dest = `${TEMP_DIR}/${asset.name}`;
    if (!existsSync(dest)) {
      await downloadFile(asset.browser_download_url, dest);
      downloaded++;
      if (downloaded % 50 === 0) {
        console.log(`Downloaded ${downloaded}/${assets.length}`);
      }
    }
  }
  console.log(`Downloaded ${downloaded} new files`);

  // Calculate hashes
  console.log('Calculating hashes...');
  const files = await readdir(TEMP_DIR);
  const hashMap = new Map(); // hash -> [filenames]
  
  for (const file of files) {
    if (!file.endsWith('.png')) continue;
    const hash = await getFileHash(`${TEMP_DIR}/${file}`);
    if (!hashMap.has(hash)) {
      hashMap.set(hash, []);
    }
    hashMap.get(hash).push(file);
  }

  // Find duplicates
  console.log('\n=== DUPLICATE GROUPS ===');
  let duplicateCount = 0;
  let uniqueCount = 0;
  
  for (const [hash, files] of hashMap) {
    if (files.length > 1) {
      duplicateCount += files.length - 1;
      console.log(`\nHash: ${hash}`);
      console.log(`Files (${files.length}):`);
      files.forEach(f => console.log(`  - ${f}`));
    } else {
      uniqueCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total files: ${files.length}`);
  console.log(`Unique hashes: ${hashMap.size}`);
  console.log(`Unique screenshots: ${uniqueCount}`);
  console.log(`Duplicate files: ${duplicateCount}`);

  // Get lesson 66 hash
  const lesson66File = files.find(f => f.startsWith('066_'));
  if (lesson66File) {
    const hash66 = await getFileHash(`${TEMP_DIR}/${lesson66File}`);
    console.log(`\nLesson 66 screenshot: ${lesson66File}`);
    console.log(`Hash: ${hash66}`);
    
    const sameHash = hashMap.get(hash66) || [];
    console.log(`Files with same hash: ${sameHash.length}`);
    sameHash.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
