import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const TMP_DIR = path.join(ROOT, '.video-tmp');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '200');
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === '1';
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map((s) => s.trim()).filter(Boolean);
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_ONLY = process.env.UPLOAD_ONLY === '1';
const EDGE_TTS_BIN = fs.existsSync('/usr/local/bin/edge-tts') ? '/usr/local/bin/edge-tts' : 'edge-tts';
const FPS = Number(process.env.VIDEO_FPS || '24');
const WIDTH = 854;
const HEIGHT = 480;
const MAX_ZOOM = Number(process.env.VIDEO_MAX_ZOOM || '1.32');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'lesson';
}

function ffPath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' }).trim();
  return Math.max(6, Math.ceil(Number(out || '6')));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function categoryFallback(category) {
  return {
    cabinet: 'dashboard.png',
    warehouse: 'products.png',
    reference: 'personnel.png',
    finance: 'accounts.png',
    reports: 'sales_report.png',
    settings: 'interface.png',
  }[category] || 'dashboard.png';
}

function screenshotFor(lesson) {
  const screenshot = lesson.screenshot ? path.join(ROOT, 'public', lesson.screenshot) : '';
  if (screenshot && fs.existsSync(screenshot)) return screenshot;

  const t = `${lesson.ruName || ''} ${lesson.uzName || ''} ${lesson.ruDescription || ''} ${lesson.ruFunctionality || ''} ${lesson.uiLocation || ''}`.toLowerCase();
  const rules = [
    ['баланс balans', 'balance.png'],
    ['товар tovar', 'products.png'],
    ['приход kirim', 'receipt.png'],
    ['возврат qaytar', 'receipt_return.png'],
    ['трансфер transfer', 'transfer.png'],
    ['реализац realizats', 'realization.png'],
    ['переоцен qarta bahol', 'reprice.png'],
    ['инвентар inventar', 'inventory.png'],
    ['списани yozib', 'writeoff.png'],
    ['группиров guruh', 'grouping.png'],
    ["весов og'irlik", 'weighted_products.png'],
    ['импорт import', 'import_products.png'],
    ['техкарт tex-kart', 'tech_cards.png'],
    ['изготов ishlab chiqar', 'manufacturing_act.png'],
    ['персонал personal', 'personnel.png'],
    ['водител haydov', 'drivers.png'],
    ['смен smena', 'shifts.png'],
    ['клиент mijoz', 'clients.png'],
    ['контрагент kontragent', 'contractors.png'],
    ['лояль loyal', 'loyalty.png'],
    ['телеграм telegram', 'telegram_bot.png'],
    ['подпис obuna', 'subscriptions.png'],
    ['тариф tarif', 'tariffs.png'],
    ['тег tag', 'tags.png'],
    ['данные kompaniya', 'company_data.png'],
    ['касс kassa', 'cash_registers.png'],
    ['ценник yorliq', 'pricetags.png'],
    ['печать chop', 'print_pricetags.png'],
    ['abc', 'abc_report.png'],
    ['xyz', 'xyz_report.png'],
    ['отчет hisobot report', 'sales_report.png'],
  ];

  for (const [needle, file] of rules) {
    if (needle.split(' ').some((k) => k && t.includes(k))) {
      return path.join(ROOT, 'public', 'screenshots', file);
    }
  }

  return path.join(ROOT, 'public', 'screenshots', categoryFallback(lesson.category));
}

function narration(lesson, locale) {
  if (locale === 'ru') {
    return `Урок ${lesson.order}. ${lesson.ruName}. ${lesson.ruDescription || ''}. ${lesson.ruFunctionality || ''}. Расположение в интерфейсе: ${lesson.uiLocation || ''}.`;
  }
  return `${lesson.order}-dars. ${lesson.uzName}. ${lesson.uzDescription || ''}. ${lesson.uzFunctionality || ''}. Interfeysdagi joylashuvi: ${lesson.uiLocation || ''}.`;
}

function sidebarTarget(location) {
  const sidebarMap = [
    ['главная', { x: 92, y: 84 }],
    ['складские операции', { x: 102, y: 132 }],
    ['справочник', { x: 86, y: 180 }],
    ['финансовые операции', { x: 100, y: 228 }],
    ['отчёты', { x: 76, y: 278 }],
    ['отчеты', { x: 76, y: 278 }],
    ['настройки', { x: 78, y: 332 }],
    ['кабинет', { x: 72, y: 382 }],
    ['выход', { x: 82, y: 440 }],
  ];

  for (const [needle, target] of sidebarMap) {
    if (location.includes(needle)) return target;
  }

  return { x: 96, y: 132 };
}

function targetForProducts(location, lessonName) {
  const t = `${location} ${lessonName}`;
  if (containsAny(t, ['поле поиска', 'поиск'])) return { x: 472, y: 278 };
  if (containsAny(t, ['фильтры', 'фильтр'])) {
    if (containsAny(t, ['категория'])) return { x: 742, y: 278 };
    if (containsAny(t, ['склад'])) return { x: 795, y: 278 };
    if (containsAny(t, ['касса'])) return { x: 780, y: 278 };
    if (containsAny(t, ['дата', 'период'])) return { x: 350, y: 112 };
    if (containsAny(t, ['статус'])) return { x: 620, y: 112 };
    if (containsAny(t, ['поставщик'])) return { x: 525, y: 112 };
    return { x: 752, y: 278 };
  }
  if (containsAny(t, ['иконка карандаша', 'редактировать'])) return { x: 784, y: 348 };
  if (containsAny(t, ['иконка корзины', 'удалить'])) return { x: 816, y: 348 };
  if (containsAny(t, ['иконка звезды', 'избран'])) return { x: 748, y: 348 };
  if (containsAny(t, ['иконка сканера', 'сканер'])) return { x: 790, y: 278 };
  if (containsAny(t, ['клик на название', 'карточка'])) return { x: 348, y: 348 };
  if (containsAny(t, ['чекбоксы', 'массовые действия', 'массовое'])) return { x: 246, y: 348 };
  if (containsAny(t, ['штрих-код'])) return { x: 530, y: 164 };
  if (containsAny(t, ['история'])) return { x: 642, y: 164 };
  if (containsAny(t, ['новая цена'])) return { x: 625, y: 255 };
  if (containsAny(t, ['поставщик'])) return { x: 342, y: 172 };
  if (containsAny(t, ['покупатель'])) return { x: 342, y: 172 };
  if (containsAny(t, ['отправитель'])) return { x: 330, y: 172 };
  if (containsAny(t, ['получатель'])) return { x: 592, y: 172 };
  if (containsAny(t, ['причина'])) return { x: 430, y: 206 };
  if (containsAny(t, ['создать', 'добавить', 'экспорт', 'провести', 'копировать', 'печать', 'отменить'])) return { x: 780, y: 44 };
  return { x: 780, y: 44 };
}

function targetForDashboard(location, lessonName) {
  const t = `${location} ${lessonName}`;
  if (t.includes('верхняя панель') && containsAny(t, ['имя пользователя', 'профиль'])) return { x: 792, y: 34 };
  if (containsAny(t, ['главная'])) return { x: 92, y: 84 };
  if (containsAny(t, ['кабинет'])) return { x: 74, y: 382 };
  if (containsAny(t, ['выход'])) return { x: 88, y: 438 };
  if (containsAny(t, ['смена пароля'])) return { x: 420, y: 198 };
  if (containsAny(t, ['уведомления'])) return { x: 420, y: 248 };
  if (containsAny(t, ['история входов'])) return { x: 420, y: 300 };
  if (containsAny(t, ['удалить аккаунт'])) return { x: 420, y: 352 };
  return { x: 420, y: 100 };
}

function targetForBalance(location, lessonName) {
  const t = `${location} ${lessonName}`;
  if (containsAny(t, ['баланс'])) return { x: 738, y: 34 };
  if (containsAny(t, ['пополнение'])) return { x: 796, y: 34 };
  if (containsAny(t, ['дата', 'период'])) return { x: 332, y: 94 };
  if (containsAny(t, ['сформировать'])) return { x: 554, y: 94 };
  return { x: 738, y: 34 };
}

function targetForListPage(location, lessonName) {
  const t = `${location} ${lessonName}`;
  if (location.includes('боковое меню')) return sidebarTarget(location);
  if (containsAny(t, ['кнопка "создать"', 'кнопка "добавить"', 'создать', 'добавить', 'начислить', 'выплатить', 'подключить', 'сохранить', 'оплатить', 'открыть', 'закрыть'])) return { x: 786, y: 46 };
  if (containsAny(t, ['кнопка "печать"', 'печать', 'экспорт', 'сменить'])) return { x: 700, y: 46 };
  if (containsAny(t, ['кнопка "удалить"', 'удалить', 'кнопка "отменить"', 'отменить'])) return { x: 792, y: 206 };
  if (containsAny(t, ['кнопка "провести"', 'провести', 'кнопка "отправить"', 'отправить', 'кнопка "принять"', 'принять'])) return { x: 742, y: 206 };
  if (containsAny(t, ['фильтры', 'фильтр'])) {
    if (containsAny(t, ['дата', 'период'])) return { x: 342, y: 112 };
    if (containsAny(t, ['поставщик'])) return { x: 520, y: 112 };
    if (containsAny(t, ['статус'])) return { x: 610, y: 112 };
    if (containsAny(t, ['касса'])) return { x: 690, y: 112 };
    return { x: 520, y: 112 };
  }
  if (containsAny(t, ['поле'])) {
    if (containsAny(t, ['должность'])) return { x: 350, y: 194 };
    if (containsAny(t, ['pin'])) return { x: 620, y: 194 };
    if (containsAny(t, ['автомобиль'])) return { x: 620, y: 194 };
    if (containsAny(t, ['логотип'])) return { x: 480, y: 186 };
    if (containsAny(t, ['язык'])) return { x: 430, y: 220 };
    return { x: 420, y: 186 };
  }
  if (containsAny(t, ['вкладка'])) {
    if (containsAny(t, ['права'])) return { x: 558, y: 154 };
    if (containsAny(t, ['история'])) return { x: 652, y: 154 };
    return { x: 560, y: 154 };
  }
  if (containsAny(t, ['колонка'])) return { x: 580, y: 214 };
  if (containsAny(t, ['клик на чек', 'клик на название'])) return { x: 340, y: 214 };
  return { x: 786, y: 46 };
}

function targetForShot(baseName, location, lessonName) {
  if (baseName === 'products.png' || baseName === 'products_page.png' || baseName === 'products_new.png') {
    return targetForProducts(location, lessonName);
  }

  if (baseName === 'dashboard.png' || baseName === 'dashboard_full.png' || baseName === 'dashboard_new.png') {
    return targetForDashboard(location, lessonName);
  }

  if (baseName === 'balance.png') {
    return targetForBalance(location, lessonName);
  }

  return targetForListPage(location, lessonName);
}

function coords(lesson) {
  const location = String(lesson.uiLocation || '').toLowerCase();
  const lessonName = String(lesson.ruName || '').toLowerCase();
  const shot = lesson.screenshot || categoryFallback(lesson.category);
  const baseName = path.basename(shot || '').toLowerCase();

  const target = targetForShot(baseName, location, lessonName);
  const start = target.x < WIDTH / 2
    ? { x: clamp(target.x + 240, 96, WIDTH - 90), y: clamp(target.y + 140, 88, HEIGHT - 60) }
    : { x: clamp(target.x - 260, 54, WIDTH - 110), y: clamp(target.y + 150, 88, HEIGHT - 60) };

  const focus = {
    w: containsAny(location, ['иконка', 'клик']) ? 64 : containsAny(location, ['поле', 'фильтр']) ? 132 : 110,
    h: containsAny(location, ['иконка', 'клик']) ? 44 : containsAny(location, ['поле', 'фильтр']) ? 42 : 38,
  };

  return {
    x1: start.x,
    y1: start.y,
    x2: clamp(target.x, 36, WIDTH - 36),
    y2: clamp(target.y, 36, HEIGHT - 36),
    focus,
    screenshot: baseName,
  };
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(text || ''), 'utf8');
}

function synthesize(text, locale, outFile) {
  const voice = locale === 'ru' ? 'ru-RU-DmitryNeural' : 'uz-UZ-SardorNeural';
  const rate = locale === 'ru' ? '-8%' : '-10%';
  execFileSync(EDGE_TTS_BIN, ['--voice', voice, `--rate=${rate}`, '--text', text, '--write-media', outFile], { stdio: 'ignore' });
}

function makeVideo(lesson, locale, imagePath, audioPath, outFile) {
  const duration = ffprobeDuration(audioPath);
  const c = coords(lesson);
  const moveEnd = Math.max(2.5, duration * 0.62);
  const zoomEnd = Math.max(3.5, duration * 0.82);
  const clickStart = Math.max(2.2, duration * 0.72);
  const work = path.join(TMP_DIR, `${lesson.order}-${locale}`);
  const title = locale === 'ru' ? lesson.ruName : lesson.uzName;
  const locationWithCoords = `${lesson.uiLocation || ''} • x:${c.x2}, y:${c.y2}`;

  fs.mkdirSync(work, { recursive: true });
  writeText(path.join(work, 'title.txt'), title);
  writeText(path.join(work, 'loc.txt'), locationWithCoords);

  const xExpr = `if(lt(t,${moveEnd}),${c.x1}+(${c.x2 - c.x1})*min(1\\,t/${moveEnd}),${c.x2})`;
  const yExpr = `if(lt(t,${moveEnd}),${c.y1}+(${c.y2 - c.y1})*min(1\\,t/${moveEnd}),${c.y2})`;
  const zoomExpr = `1+(${MAX_ZOOM - 1})*min(1\\,t/${zoomEnd})`;
  const highlightX = c.x2 - Math.round(c.focus.w / 2);
  const highlightY = c.y2 - Math.round(c.focus.h / 2);

  const preZoom = [
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease`,
    `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white`,
    'format=yuv420p',
    `drawbox=x=${highlightX}:y=${highlightY}:w=${c.focus.w}:h=${c.focus.h}:color=yellow@0.55:t=3:enable='between(t,${clickStart - 0.15},${duration})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='●':fontsize=42:fontcolor=black@0.28:x='(${xExpr})-17':y='(${yExpr})-13'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='●':fontsize=28:fontcolor=yellow:borderw=2:bordercolor=black:x='(${xExpr})-12':y='(${yExpr})-9'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='◎':fontsize=62:fontcolor=white@0.92:x='${c.x2 - 25}':y='${c.y2 - 27}':enable='between(t,${clickStart},${clickStart + 0.18})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='◎':fontsize=96:fontcolor=yellow@0.72:x='${c.x2 - 41}':y='${c.y2 - 43}':enable='between(t,${clickStart + 0.1},${clickStart + 0.34})'`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='✦':fontsize=48:fontcolor=white@0.96:x='${c.x2 - 14}':y='${c.y2 - 30}':enable='between(t,${clickStart},${clickStart + 0.1})'`,
    `scale=w='trunc(${WIDTH}*(${zoomExpr})/2)*2':h='trunc(${HEIGHT}*(${zoomExpr})/2)*2':eval=frame`,
    `crop=${WIDTH}:${HEIGHT}:x='max(0,min(iw-${WIDTH},${c.x2}*(iw/${WIDTH})-${WIDTH}/2))':y='max(0,min(ih-${HEIGHT},${c.y2}*(ih/${HEIGHT})-${HEIGHT}/2))'`,
    `drawbox=x=0:y=0:w=iw:h=58:color=black@0.44:t=fill`,
    `drawbox=x=0:y=ih-76:w=iw:h=76:color=black@0.44:t=fill`,
    `drawtext=fontfile=${ffPath(FONT_BOLD)}:textfile=${ffPath(path.join(work, 'title.txt'))}:fontsize=28:fontcolor=white:x=24:y=14`,
    `drawtext=fontfile=${ffPath(FONT_REG)}:textfile=${ffPath(path.join(work, 'loc.txt'))}:fontsize=18:fontcolor=white:x=24:y=h-48`,
  ].join(',');

  execFileSync('ffmpeg', [
    '-y',
    '-threads', '1',
    '-loop', '1',
    '-framerate', String(FPS),
    '-t', String(duration),
    '-i', imagePath,
    '-i', audioPath,
    '-filter_complex', `[0:v]${preZoom}[v]`,
    '-map', '[v]',
    '-map', '1:a',
    '-r', String(FPS),
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'stillimage',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-b:v', '900k',
    '-shortest',
    outFile,
  ], { stdio: 'ignore' });
}

function parseVideoMap(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
  } catch {}
  return {};
}

async function uploadVideo(filePath, order, locale, lesson) {
  const fileName = path.basename(filePath);
  if (!BLOB_ENABLED) {
    return `/generated-videos/${fileName}`;
  }

  const blobPath = `lesson-videos/${String(order).padStart(3, '0')}/${locale}/${slugify(locale === 'ru' ? lesson.ruName : lesson.uzName)}.mp4`;
  const buffer = fs.readFileSync(filePath);
  const result = await put(blobPath, buffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'video/mp4',
  });
  return result.url;
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { order: { gte: FROM, lte: TO } },
    orderBy: { order: 'asc' },
  });

  console.log(`Lessons loaded: ${lessons.length}`);
  if (lessons.length === 0) return;

  for (const lesson of lessons) {
    let map = parseVideoMap(lesson.videoUrl);
    if (!map.default && lesson.videoUrl && !lesson.videoUrl.trim().startsWith('{')) {
      map.default = lesson.videoUrl;
    }

    for (const locale of LOCALES) {
      const base = `${String(lesson.order).padStart(3, '0')}-${locale}-${locale === 'ru' ? 'lesson' : slugify(lesson.uzName)}`;
      const audioPath = path.join(TMP_DIR, `${base}.mp3`);
      const videoPath = path.join(OUT_DIR, `${base}.mp4`);
      const alreadyMapped = typeof map[locale] === 'string' && map[locale];
      const localReady = fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100000;
      const c = coords(lesson);

      console.log(`Lesson ${lesson.order} ${locale}: start (${c.screenshot}) -> x:${c.x2}, y:${c.y2}`);

      if (!alreadyMapped || FORCE_REGENERATE) {
        if (!UPLOAD_ONLY && (!localReady || FORCE_REGENERATE)) {
          const shot = screenshotFor(lesson);
          if (!fs.existsSync(shot)) {
            throw new Error(`Screenshot not found for lesson ${lesson.order}: ${shot}`);
          }
          synthesize(narration(lesson, locale), locale, audioPath);
          makeVideo(lesson, locale, shot, audioPath, videoPath);
        }

        if (!(fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100000)) {
          throw new Error(`Video not generated for lesson ${lesson.order} ${locale}`);
        }

        const url = await uploadVideo(videoPath, lesson.order, locale, lesson);
        map[locale] = url;
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { videoUrl: JSON.stringify(map) },
        });
        console.log(`Lesson ${lesson.order} ${locale}: uploaded`);
      } else {
        console.log(`Lesson ${lesson.order} ${locale}: skipped (db already has url)`);
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
