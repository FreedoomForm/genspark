import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '200');
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === '1';
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map((s) => s.trim()).filter(Boolean);
const EDGE_TTS_BIN = fs.existsSync('/usr/local/bin/edge-tts') ? '/usr/local/bin/edge-tts' : 'edge-tts';

// Video settings
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 1; // 1 frame per second for static image (smaller file)

// GitHub Release URL base
const GITHUB_REPO = 'FreedoomForm/genspark';
const GITHUB_RELEASE_TAG = 'lesson-videos';

fs.mkdirSync(OUT_DIR, { recursive: true });

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'lesson';
}

function ffprobeDuration(file) {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' }).trim();
    return Math.max(3, Math.ceil(Number(out || '3')));
  } catch {
    return 3;
  }
}

function getScreenshot(lesson) {
  // Check if screenshot exists in lesson data
  if (lesson.screenshot) {
    const screenshotPath = path.join(ROOT, 'public', lesson.screenshot);
    if (fs.existsSync(screenshotPath)) {
      return screenshotPath;
    }
  }
  
  // Check for screenshot in public/screenshots
  const possiblePaths = [
    path.join(ROOT, 'public', 'screenshots', `${String(lesson.order).padStart(3, '0')}.png`),
    path.join(ROOT, 'public', 'screenshots', `${String(lesson.order).padStart(3, '0')}.jpg`),
    path.join(ROOT, 'public', 'screenshots', `lesson-${lesson.order}.png`),
    path.join(ROOT, 'public', 'screenshots', `lesson-${lesson.order}.jpg`),
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  
  // Fallback to placeholder
  const placeholder = path.join(ROOT, 'public', 'placeholder.png');
  if (fs.existsSync(placeholder)) return placeholder;
  
  return null;
}

function getTextForTTS(lesson, locale) {
  // Get text content for narration
  if (locale === 'ru') {
    const parts = [];
    if (lesson.ruName) parts.push(lesson.ruName);
    if (lesson.ruDescription) parts.push(lesson.ruDescription);
    if (lesson.ruFunctionality) parts.push(lesson.ruFunctionality);
    if (lesson.ruSteps) {
      try {
        const steps = JSON.parse(lesson.ruSteps);
        if (Array.isArray(steps)) {
          parts.push('Шаги: ' + steps.join('. '));
        }
      } catch {
        parts.push(lesson.ruSteps);
      }
    }
    if (lesson.ruTips) parts.push('Советы: ' + lesson.ruTips);
    if (lesson.ruUseCase) parts.push('Применение: ' + lesson.ruUseCase);
    return parts.join('. ');
  } else {
    const parts = [];
    if (lesson.uzName) parts.push(lesson.uzName);
    if (lesson.uzDescription) parts.push(lesson.uzDescription);
    if (lesson.uzFunctionality) parts.push(lesson.uzFunctionality);
    if (lesson.uzSteps) {
      try {
        const steps = JSON.parse(lesson.uzSteps);
        if (Array.isArray(steps)) {
          parts.push('Qadamlar: ' + steps.join('. '));
        }
      } catch {
        parts.push(lesson.uzSteps);
      }
    }
    if (lesson.uzTips) parts.push('Maslahatlar: ' + lesson.uzTips);
    if (lesson.uzUseCase) parts.push('Qo\'llash: ' + lesson.uzUseCase);
    return parts.join('. ');
  }
}

function generateTTS(text, locale, outFile) {
  // Voice settings
  const voice = locale === 'ru' 
    ? 'ru-RU-DmitryNeural'  // Russian male voice
    : 'uz-UZ-SardorNeural'; // Uzbek male voice (fallback to similar)
  
  const rate = '-10%'; // Slightly slower for clarity
  
  // Truncate text if too long (edge-tts has limits)
  const maxLen = 5000;
  const shortText = text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  
  if (!shortText.trim()) {
    // Create silent audio if no text
    execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '3', outFile], { stdio: 'ignore' });
    return;
  }
  
  try {
    execFileSync(EDGE_TTS_BIN, ['--voice', voice, `--rate=${rate}`, '--text', shortText, '--write-media', outFile], { 
      stdio: 'ignore',
      timeout: 60000 
    });
  } catch (error) {
    console.log(`TTS failed for ${locale}, trying fallback...`);
    // Fallback to different voice
    const fallbackVoice = locale === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-GuyNeural';
    try {
      execFileSync(EDGE_TTS_BIN, ['--voice', fallbackVoice, '--text', shortText, '--write-media', outFile], { 
        stdio: 'ignore',
        timeout: 60000 
      });
    } catch (error2) {
      console.log(`TTS still failed, creating silent audio...`);
      execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '3', outFile], { stdio: 'ignore' });
    }
  }
}

function getImageDimensions(imagePath) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error', 
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', 
      '-of', 'csv=p=0:s=x', 
      imagePath
    ], { encoding: 'utf8' }).trim();
    const [w, h] = out.split('x').map(Number);
    return { width: w, height: h };
  } catch {
    return { width: WIDTH, height: HEIGHT };
  }
}

function makeVideo(imagePath, audioPath, outFile, title) {
  const duration = ffprobeDuration(audioPath);
  const imgDim = getImageDimensions(imagePath);
  
  // Calculate aspect ratio
  const imgRatio = imgDim.width / imgDim.height;
  const targetRatio = WIDTH / HEIGHT; // 16:9 = 1.777...
  
  let scaleFilter;
  
  if (Math.abs(imgRatio - targetRatio) < 0.01) {
    // Already 16:9 - just scale to target size
    scaleFilter = `scale=${WIDTH}:${HEIGHT}`;
  } else if (imgRatio > targetRatio) {
    // Wider than 16:9 - fit width, add bars top/bottom
    scaleFilter = `scale=${WIDTH}:-2,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white`;
  } else {
    // Taller than 16:9 - fit height, add bars left/right (or crop)
    // Option 1: Add bars
    // scaleFilter = `scale=-2:${HEIGHT},pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white`;
    
    // Option 2: Scale to fill and crop (zoom effect)
    scaleFilter = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`;
  }
  
  const args = [
    '-y',
    '-loop', '1',
    '-framerate', '1',
    '-t', String(duration + 0.5),
    '-i', imagePath,
    '-i', audioPath,
    '-vf', `${scaleFilter},format=yuv420p`,
    '-map', '0:v',
    '-map', '1:a',
    '-r', '1',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'stillimage',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-b:v', '500k',
    '-shortest',
    outFile,
  ];
  
  console.log(`    Image: ${imgDim.width}x${imgDim.height} (${imgRatio.toFixed(2)}), scale: ${scaleFilter.split(',')[0]}`);
  execFileSync('ffmpeg', args, { stdio: 'ignore' });
}

function parseVideoMap(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
  } catch {}
  return {};
}

function getGitHubReleaseUrl(order, locale, lesson) {
  const fileName = `${String(order).padStart(3, '0')}-${locale}-${slugify(locale === 'ru' ? lesson.ruName : lesson.uzName)}.mp4`;
  return `https://github.com/${GITHUB_REPO}/releases/download/${GITHUB_RELEASE_TAG}/${fileName}`;
}

async function main() {
  console.log('=== Simple Video Generator ===');
  console.log(`Lessons: ${FROM} to ${TO}`);
  console.log(`Locales: ${LOCALES.join(', ')}`);
  console.log(`Force regenerate: ${FORCE_REGENERATE}`);
  
  const lessons = await prisma.lesson.findMany({
    where: { order: { gte: FROM, lte: TO } },
    orderBy: { order: 'asc' },
  });

  console.log(`Found ${lessons.length} lessons`);
  
  if (lessons.length === 0) {
    console.log('No lessons found!');
    return;
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const lesson of lessons) {
    console.log(`\n--- Lesson ${lesson.order}: ${lesson.ruName || lesson.uzName || 'unnamed'} ---`);
    
    const screenshot = getScreenshot(lesson);
    if (!screenshot) {
      console.log(`  ⚠ No screenshot found, skipping`);
      skipped++;
      continue;
    }
    console.log(`  📷 Screenshot: ${path.basename(screenshot)}`);

    let map = parseVideoMap(lesson.videoUrl);

    for (const locale of LOCALES) {
      const outFile = path.join(OUT_DIR, `${String(lesson.order).padStart(3, '0')}-${locale}-${slugify(locale === 'ru' ? lesson.ruName : lesson.uzName)}.mp4`);
      
      // Check if already exists
      if (fs.existsSync(outFile) && !FORCE_REGENERATE) {
        console.log(`  ✅ ${locale}: already exists`);
        const url = getGitHubReleaseUrl(lesson.order, locale, lesson);
        map[locale] = url;
        continue;
      }

      // Generate TTS
      const text = getTextForTTS(lesson, locale);
      if (!text.trim()) {
        console.log(`  ⚠ ${locale}: no text content, skipping`);
        continue;
      }
      
      console.log(`  🎙 ${locale}: generating TTS (${text.length} chars)...`);
      const audioPath = path.join(OUT_DIR, `.tmp-${lesson.order}-${locale}.mp3`);
      
      try {
        generateTTS(text, locale, audioPath);
        
        // Generate video
        console.log(`  🎬 ${locale}: creating video...`);
        makeVideo(screenshot, audioPath, outFile, locale === 'ru' ? lesson.ruName : lesson.uzName);
        
        // Cleanup temp audio
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        
        // Update URL map
        const url = getGitHubReleaseUrl(lesson.order, locale, lesson);
        map[locale] = url;
        generated++;
        console.log(`  ✅ ${locale}: ${path.basename(outFile)}`);
      } catch (error) {
        console.log(`  ❌ ${locale}: ${error.message}`);
        errors++;
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }
    }

    // Update database with video URLs
    if (Object.keys(map).length > 0) {
      try {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { videoUrl: JSON.stringify(map) },
        });
      } catch (error) {
        console.log(`  ⚠ Failed to update database: ${error.message}`);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nVideos saved to: ${OUT_DIR}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
