import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const TMP_DIR = path.join(ROOT, '.video-tmp');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const FROM = Number(process.env.FROM || '1');
const TO = Number(process.env.TO || '10');
const LOCALES = (process.env.LOCALES || 'ru,uz').split(',').map(s => s.trim()).filter(Boolean);

function loadLessons() {
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'seed-lessons.ts'), 'utf8');
  const start = src.indexOf('const lessons = [');
  const end = src.indexOf('];\n\nasync function main()');
  const arrayLiteral = src.slice(start + 'const lessons = '.length, end + 1);
  return Function(`return (${arrayLiteral});`)();
}

function slugify(input) {
  return String(input || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'lesson';
}

function ffPath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function ffprobeDuration(file) {
  return Math.max(6, Math.ceil(Number(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1', file], { encoding:'utf8' }).trim() || '6')));
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
  const t = `${lesson.ruName} ${lesson.uzName} ${lesson.ruDescription} ${lesson.ruFunctionality} ${lesson.uiLocation}`.toLowerCase();
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
    ['весов og\'irlik', 'weighted_products.png'],
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
    if (needle.split(' ').some(k => k && t.includes(k))) return path.join(ROOT, 'public', 'screenshots', file);
  }
  return path.join(ROOT, 'public', 'screenshots', categoryFallback(lesson.category));
}

function narration(lesson, locale) {
  if (locale === 'ru') {
    return `Урок ${lesson.order}. ${lesson.ruName}. ${lesson.ruDescription}. ${lesson.ruFunctionality}. Расположение в интерфейсе: ${lesson.uiLocation}.`;
  }
  return `${lesson.order}-dars. ${lesson.uzName}. ${lesson.uzDescription}. ${lesson.uzFunctionality}. Interfeysdagi joylashuvi: ${lesson.uiLocation}.`;
}

function coords(lesson) {
  const t = String(lesson.uiLocation || '').toLowerCase();
  if (t.includes('боковое меню')) return { x1: 60, y1: 160, x2: 180, y2: 250 };
  if (t.includes('верхняя панель')) return { x1: 700, y1: 50, x2: 800, y2: 70 };
  if (t.includes('поиск')) return { x1: 600, y1: 120, x2: 500, y2: 120 };
  if (t.includes('фильтр')) return { x1: 760, y1: 140, x2: 650, y2: 145 };
  if (t.includes('кнопка')) return { x1: 760, y1: 120, x2: 680, y2: 120 };
  return { x1: 700, y1: 140, x2: 400, y2: 240 };
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(text || ''), 'utf8');
}

function synthesize(text, locale, outFile) {
  const voice = locale === 'ru' ? 'ru-RU-DmitryNeural' : 'uz-UZ-SardorNeural';
  const rate = locale === 'ru' ? '-8%' : '-10%';
  execFileSync('edge-tts', ['--voice', voice, `--rate=${rate}`, '--text', text, '--write-media', outFile], { stdio: 'ignore' });
}

function makeVideo(lesson, locale, imagePath, audioPath, outFile) {
  const duration = ffprobeDuration(audioPath);
  const c = coords(lesson);
  const xExpr = `${c.x1}+(${c.x2 - c.x1})*min(1\\,t/${duration})`;
  const yExpr = `${c.y1}+(${c.y2 - c.y1})*min(1\\,t/${duration})`;
  const work = path.join(TMP_DIR, `${lesson.order}-${locale}`);
  const title = locale === 'ru' ? lesson.ruName : lesson.uzName;
  writeText(path.join(work, 'title.txt'), title);
  writeText(path.join(work, 'loc.txt'), lesson.uiLocation || '');

  const filter = `[0:v]scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2,format=yuv420p,drawbox=x=0:y=0:w=iw:h=58:color=black@0.45:t=fill,drawbox=x=0:y=ih-76:w=iw:h=76:color=black@0.45:t=fill,drawtext=fontfile=${ffPath(FONT_BOLD)}:textfile=${ffPath(path.join(work,'title.txt'))}:fontsize=28:fontcolor=white:x=24:y=14,drawtext=fontfile=${ffPath(FONT_REG)}:textfile=${ffPath(path.join(work,'loc.txt'))}:fontsize=18:fontcolor=white:x=24:y=h-48,drawtext=fontfile=${ffPath(FONT_BOLD)}:text='\\u25CF':fontsize=34:fontcolor=yellow:borderw=3:bordercolor=black:x='${xExpr}':y='${yExpr}'[v]`;

  execFileSync('ffmpeg', ['-y','-threads','1','-loop','1','-framerate','24','-t',String(duration),'-i',imagePath,'-i',audioPath,'-filter_complex',filter,'-map','[v]','-map','1:a','-r','24','-c:v','libx264','-preset','ultrafast','-tune','stillimage','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-b:v','700k','-shortest',outFile], { stdio: 'ignore' });
}

const lessons = loadLessons().filter(x => x.order >= FROM && x.order <= TO);
for (const lesson of lessons) {
  for (const locale of LOCALES) {
    const base = `${String(lesson.order).padStart(3,'0')}-${locale}-${locale === 'ru' ? 'lesson' : slugify(lesson.uzName)}`;
    const audio = path.join(TMP_DIR, `${base}.mp3`);
    const video = path.join(OUT_DIR, `${base}.mp4`);
    if (fs.existsSync(video) && fs.statSync(video).size > 100000) continue;
    const shot = screenshotFor(lesson);
    synthesize(narration(lesson, locale), locale, audio);
    makeVideo(lesson, locale, shot, audio, video);
    console.log(`done ${base}`);
  }
}
