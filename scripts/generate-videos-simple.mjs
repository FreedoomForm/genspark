import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const TMP_DIR = path.join(ROOT, '.video-tmp');
const SCREENSHOTS_DIR = path.join(ROOT, 'public', 'screenshots');
const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '183');
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === '1';
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map((s) => s.trim()).filter(Boolean);
const EDGE_TTS_BIN = fs.existsSync('/usr/local/bin/edge-tts') ? '/usr/local/bin/edge-tts' : 'edge-tts';
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'FreedoomForm/genspark';
const GITHUB_RELEASE_TAG = process.env.VIDEO_RELEASE_TAG || 'lesson-videos';
const WIDTH = 1280;
const HEIGHT = 720;

for (const dir of [OUT_DIR, TMP_DIR]) fs.mkdirSync(dir, { recursive: true });

function log(...args) {
  console.log('[video]', ...args);
}

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

function safeJson(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

async function downloadRemoteScreenshot(url, fileName) {
  const out = path.join(TMP_DIR, fileName);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Screenshot download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  return out;
}

async function getScreenshotPath(lesson) {
  const candidates = [];
  if (lesson.screenshot) {
    if (isHttpUrl(lesson.screenshot)) {
      return downloadRemoteScreenshot(lesson.screenshot, `${String(lesson.order).padStart(3, '0')}-remote.png`);
    }
    candidates.push(path.join(ROOT, lesson.screenshot));
    candidates.push(path.join(ROOT, 'public', lesson.screenshot));
  }

  const prefix = `${String(lesson.order).padStart(3, '0')}_`;
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    for (const file of fs.readdirSync(SCREENSHOTS_DIR)) {
      if (file.startsWith(prefix) && file.endsWith('.png')) candidates.push(path.join(SCREENSHOTS_DIR, file));
    }
  }

  for (const file of [
    path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'release', `${prefix}route.png`),
    path.join(ROOT, 'public', 'generated-screenshots', 'lume', 'raw', `${prefix}route.png`),
  ]) candidates.push(file);

  return candidates.find((file) => fs.existsSync(file)) || null;
}

function parseSteps(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildNarration(lesson, locale) {
  const isRu = locale === 'ru';
  const parts = [];
  
  if (isRu) {
    // Title and description
    if (lesson.ruName) parts.push(lesson.ruName);
    if (lesson.ruDescription) parts.push(lesson.ruDescription);
    
    // Functionality
    if (lesson.ruFunctionality) {
      parts.push(`Функциональность: ${lesson.ruFunctionality}`);
    }
    
    // Steps as numbered list
    const ruSteps = parseSteps(lesson.ruSteps);
    if (ruSteps.length > 0) {
      const stepsText = ruSteps.map((step, i) => `${i + 1}. ${step}`).join('. ');
      parts.push(`Инструкция: ${stepsText}`);
    }
    
    // Tips
    if (lesson.ruTips) {
      parts.push(`Советы: ${lesson.ruTips}`);
    }
    
    // Use case
    if (lesson.ruUseCase) {
      parts.push(`Применение: ${lesson.ruUseCase}`);
    }
  } else {
    // Uzbek (Latin)
    if (lesson.uzName) parts.push(lesson.uzName);
    if (lesson.uzDescription) parts.push(lesson.uzDescription);
    
    // Functionality
    if (lesson.uzFunctionality) {
      parts.push(`Funksionallik: ${lesson.uzFunctionality}`);
    }
    
    // Steps as numbered list
    const uzSteps = parseSteps(lesson.uzSteps);
    if (uzSteps.length > 0) {
      const stepsText = uzSteps.map((step, i) => `${i + 1}. ${step}`).join('. ');
      parts.push(`Ko'rsatma: ${stepsText}`);
    }
    
    // Tips
    if (lesson.uzTips) {
      parts.push(`Maslahatlar: ${lesson.uzTips}`);
    }
    
    // Use case
    if (lesson.uzUseCase) {
      parts.push(`Qo'llash: ${lesson.uzUseCase}`);
    }
  }
  
  return parts.join('. ').replace(/\s+/g, ' ').trim();
}

function generateTTS(text, locale, outFile) {
  const voice = locale === 'ru' ? 'ru-RU-DmitryNeural' : 'uz-UZ-SardorNeural';
  const fallbackVoice = locale === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-GuyNeural';
  const cleanText = String(text || '').slice(0, 4500).trim();

  if (!cleanText) {
    execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '3', outFile], { stdio: 'ignore' });
    return;
  }

  try {
    execFileSync(EDGE_TTS_BIN, ['--voice', voice, '--rate=-10%', '--text', cleanText, '--write-media', outFile], { stdio: 'ignore', timeout: 120000 });
  } catch {
    try {
      execFileSync(EDGE_TTS_BIN, ['--voice', fallbackVoice, '--text', cleanText, '--write-media', outFile], { stdio: 'ignore', timeout: 120000 });
    } catch {
      execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '3', outFile], { stdio: 'ignore' });
    }
  }
}

function makeVideo(imagePath, audioPath, outFile) {
  const duration = ffprobeDuration(audioPath) + 0.5;
  execFileSync('ffmpeg', [
    '-y',
    '-loop', '1',
    '-framerate', '1',
    '-t', String(duration),
    '-i', imagePath,
    '-i', audioPath,
    '-vf', `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},format=yuv420p`,
    '-map', '0:v',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'stillimage',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-shortest',
    outFile,
  ], { stdio: 'ignore' });
}

function releaseUrl(fileName) {
  return `https://github.com/${GITHUB_REPO}/releases/download/${GITHUB_RELEASE_TAG}/${encodeURIComponent(fileName)}`;
}

async function main() {
  log(`range=${FROM}..${TO} locales=${LOCALES.join(',')} force=${FORCE_REGENERATE}`);
  const lessons = await prisma.lesson.findMany({ where: { order: { gte: FROM, lte: TO } }, orderBy: { order: 'asc' } });
  log(`lessons=${lessons.length}`);

  for (const lesson of lessons) {
    const screenshotPath = await getScreenshotPath(lesson);
    if (!screenshotPath) {
      log(`#${lesson.order} skip: screenshot not found`);
      continue;
    }

    const videoMap = safeJson(lesson.videoUrl);
    for (const locale of LOCALES) {
      const name = locale === 'ru' ? lesson.ruName : (lesson.uzName || lesson.ruName);
      const baseName = `${String(lesson.order).padStart(3, '0')}-${locale}-${slugify(name)}`;
      const outFile = path.join(OUT_DIR, `${baseName}.mp4`);
      const audioFile = path.join(TMP_DIR, `${baseName}.mp3`);

      if (fs.existsSync(outFile) && !FORCE_REGENERATE) {
        videoMap[locale] = releaseUrl(path.basename(outFile));
        videoMap.default = videoMap.ru || videoMap.uz || videoMap.default || null;
        continue;
      }

      const narration = buildNarration(lesson, locale);
      if (!narration) {
        log(`#${lesson.order} ${locale} skip: empty narration`);
        continue;
      }

      log(`#${lesson.order} ${locale} generating`);
      generateTTS(narration, locale, audioFile);
      makeVideo(screenshotPath, audioFile, outFile);
      if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile);

      videoMap[locale] = releaseUrl(path.basename(outFile));
      videoMap.default = videoMap.ru || videoMap.uz || videoMap.default || null;
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoUrl: JSON.stringify(videoMap), updatedAt: new Date() },
    }).catch((error) => log(`#${lesson.order} db update warn: ${error.message}`));
  }
}

main()
  .catch((error) => {
    console.error('[video] fatal:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
