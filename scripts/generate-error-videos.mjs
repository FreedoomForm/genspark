// scripts/generate-error-videos.mjs
//
// Generate videos for error lessons using edge-tts + ffmpeg
// Similar to generate-videos-simple.mjs but specifically for error lessons (order >= 1000)
//
// ENV:
//   DATABASE_URL      - Neon Postgres
//   FORCE_REGENERATE - 1 = regenerate even if videoUrl exists
//   LOCALES           - comma-separated locales (default: ru,uz)

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();

const FORCE = process.env.FORCE_REGENERATE === '1';
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map(s => s.trim()).filter(Boolean);

const OUTPUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const SCREENSHOTS_DIR = path.join(ROOT, 'public', 'screenshots');

// Voice mappings for edge-tts
const VOICES = {
  ru: {
    male: 'ru-RU-DmitryNeural',
    female: 'ru-RU-SvetlanaNeural',
  },
  uz: {
    male: 'uz-UZ-SardorNeural',
    female: 'uz-UZ-NigoraNeural',
  },
};

function log(...a) { console.log('[error-videos]', ...a); }

async function exec(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${cmd} exited with ${code}: ${stderr}`));
    });
  });
}

async function generateTTS(text, outputPath, locale) {
  const voice = VOICES[locale]?.male || 'ru-RU-DmitryNeural';
  const cmd = 'edge-tts';
  const args = ['--voice', voice, '--text', text, '--write-media', outputPath];
  await exec(cmd, args);
}

async function getVideoDuration(videoPath) {
  try {
    const result = await exec('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', videoPath
    ]);
    return parseFloat(result.trim()) || 5;
  } catch {
    return 5;
  }
}

async function createVideo(screenshotPath, audioPath, outputPath) {
  // Get audio duration
  const duration = await getVideoDuration(audioPath);

  // Create video from screenshot + audio
  const args = [
    '-loop', '1',
    '-i', screenshotPath,
    '-i', audioPath,
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    '-t', String(duration + 0.5),
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:white',
    '-y', outputPath
  ];

  await exec('ffmpeg', args);
}

function buildLessonText(lesson, locale) {
  const prefix = locale === 'ru' ? 'ru' : 'uz';
  const name = lesson[`${prefix}Name`] || '';
  const description = lesson[`${prefix}Description`] || '';
  const functionality = lesson[`${prefix}Functionality`] || '';
  const steps = lesson[`${prefix}Steps`];
  const tips = lesson[`${prefix}Tips`] || '';
  const useCase = lesson[`${prefix}UseCase`] || '';

  let stepsText = '';
  if (steps) {
    try {
      const stepsArray = typeof steps === 'string' ? JSON.parse(steps) : steps;
      if (Array.isArray(stepsArray)) {
        stepsText = stepsArray.map((s, i) => `${i + 1}. ${s}`).join('\n\n');
      }
    } catch {}
  }

  const parts = [name, description, functionality, stepsText, tips, useCase].filter(Boolean);
  return parts.join('\n\n');
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all error lessons (order >= 1000)
  const lessons = await prisma.lesson.findMany({
    where: {
      order: { gte: 1000 }
    },
    orderBy: { order: 'asc' },
  });

  log(`Found ${lessons.length} error lessons`);

  for (const lesson of lessons) {
    const tag = `[${lesson.order}]`;

    // Check if video already exists
    const existingVideo = lesson.videoUrl;
    if (!FORCE && existingVideo) {
      log(`${tag} already has video, skip`);
      continue;
    }

    // Get screenshot path
    const screenshotFile = path.basename(lesson.screenshot || '');
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotFile);

    if (!fs.existsSync(screenshotPath)) {
      log(`${tag} screenshot not found: ${screenshotFile}`);
      continue;
    }

    // Generate video for each locale
    const videoUrls = {};

    for (const locale of LOCALES) {
      const text = buildLessonText(lesson, locale);
      if (!text) {
        log(`${tag} no text for locale ${locale}`);
        continue;
      }

      const audioPath = path.join(OUTPUT_DIR, `${lesson.order}-${locale}.mp3`);
      const videoPath = path.join(OUTPUT_DIR, `${lesson.order}-${locale}.mp4`);

      try {
        log(`${tag} generating TTS for ${locale}...`);
        await generateTTS(text, audioPath, locale);

        log(`${tag} creating video for ${locale}...`);
        await createVideo(screenshotPath, audioPath, videoPath);

        // Clean up audio file
        fs.unlinkSync(audioPath);

        videoUrls[locale] = videoPath;
        log(`${tag} ${locale} done`);
      } catch (e) {
        log(`${tag} ${locale} failed: ${e.message}`);
      }
    }

    // Update lesson with video URLs if generated
    if (Object.keys(videoUrls).length > 0) {
      // Video URLs will be synced by sync-video-release-urls.mjs
      log(`${tag} videos generated, will sync URLs later`);
    }
  }

  log('Done!');
}

main()
  .catch((e) => {
    console.error('[error-videos] fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
