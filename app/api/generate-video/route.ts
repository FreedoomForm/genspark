import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated-videos');
const TMP_DIR = path.join(ROOT, '.video-tmp');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const WIDTH = 854;
const HEIGHT = 480;
const FPS = 24;
const MAX_ZOOM = 1.32;

// Ensure directories exist
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Lessons data
const lessons = [
  { order: 1, category: 'cabinet', ruName: 'Главная', uzName: 'Bosh sahifa', ruDescription: 'Главная страница', screenshot: 'screenshots/dashboard.png', uiLocation: 'Боковое меню → Главная' },
  { order: 2, category: 'cabinet', ruName: 'Баланс', uzName: 'Balans', ruDescription: 'Баланс счёта', screenshot: 'screenshots/balance.png', uiLocation: 'Верхняя панель → Баланс' },
  { order: 6, category: 'warehouse', ruName: 'Товары', uzName: 'Tovarlar', ruDescription: 'Список товаров', screenshot: 'screenshots/products.png', uiLocation: 'Складские операции → Товары' },
  { order: 7, category: 'warehouse', ruName: 'Добавить товар', uzName: 'Tovar qo\'shish', ruDescription: 'Создание товара', screenshot: 'screenshots/products.png', uiLocation: 'Товары → Кнопка Добавить' },
  { order: 21, category: 'warehouse', ruName: 'Приход', uzName: 'Kirim', ruDescription: 'Список приходов', screenshot: 'screenshots/receipt.png', uiLocation: 'Складские операции → Приход' },
  { order: 41, category: 'warehouse', ruName: 'Трансфер', uzName: 'Transfer', ruDescription: 'Перемещение товаров', screenshot: 'screenshots/transfer.png', uiLocation: 'Складские операции → Трансфер' },
  { order: 51, category: 'warehouse', ruName: 'Реализация', uzName: 'Realizatsiya', ruDescription: 'Отгрузка товаров', screenshot: 'screenshots/realization.png', uiLocation: 'Складские операции → Реализация' },
  { order: 61, category: 'warehouse', ruName: 'Инвентаризация', uzName: 'Inventarizatsiya', ruDescription: 'Сверка остатков', screenshot: 'screenshots/inventory.png', uiLocation: 'Складские операции → Инвентаризация' },
  { order: 66, category: 'warehouse', ruName: 'Списание', uzName: 'Yozib chiqarish', ruDescription: 'Списание товаров', screenshot: 'screenshots/writeoff.png', uiLocation: 'Складские операции → Списание' },
  { order: 86, category: 'reference', ruName: 'Персонал', uzName: 'Personal', ruDescription: 'Сотрудники', screenshot: 'screenshots/personnel.png', uiLocation: 'Справочник → Персонал' },
  { order: 91, category: 'reference', ruName: 'Клиенты', uzName: 'Mijozlar', ruDescription: 'Список клиентов', screenshot: 'screenshots/clients.png', uiLocation: 'Справочник → Клиенты' },
  { order: 93, category: 'reference', ruName: 'Контрагенты', uzName: 'Kontragentlar', ruDescription: 'Контрагенты', screenshot: 'screenshots/contractors.png', uiLocation: 'Справочник → Контрагенты' },
  { order: 121, category: 'reports', ruName: 'Отчёт о продажах', uzName: 'Sotuv hisoboti', ruDescription: 'Отчёт', screenshot: 'screenshots/sales_report.png', uiLocation: 'Отчёты → Отчёт о продажах' },
  { order: 151, category: 'settings', ruName: 'Параметры', uzName: 'Parametrlar', ruDescription: 'Параметры', screenshot: 'screenshots/parameters.png', uiLocation: 'Настройки → Параметры' },
  { order: 153, category: 'settings', ruName: 'Интерфейс', uzName: 'Interfeys', ruDescription: 'Настройки интерфейса', screenshot: 'screenshots/interface.png', uiLocation: 'Настройки → Интерфейс' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getButtonCoords(lesson: any) {
  const location = String(lesson.uiLocation || '').toLowerCase();
  if (location.includes('главная')) return { x: 53, y: 70 };
  if (location.includes('складские')) return { x: 53, y: 102 };
  if (location.includes('справочник')) return { x: 53, y: 132 };
  if (location.includes('финансовые')) return { x: 53, y: 163 };
  if (location.includes('отчёт') || location.includes('отчет')) return { x: 53, y: 194 };
  if (location.includes('настройки')) return { x: 53, y: 225 };
  if (location.includes('добавить') || location.includes('создать')) return { x: 790, y: 36 };
  if (location.includes('баланс')) return { x: 630, y: 16 };
  return { x: 427, y: 120 };
}

function ffPath(p: string) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function generateVideo(lesson: any, locale: string): { success: boolean; error?: string; path?: string } {
  const base = `${String(lesson.order).padStart(3, '0')}-${locale}`;
  const audioPath = path.join(TMP_DIR, `${base}.mp3`);
  const videoPath = path.join(OUT_DIR, `${base}.mp4`);
  
  try {
    // 1. TTS
    const text = locale === 'ru' 
      ? `Урок ${lesson.order}. ${lesson.ruName}. ${lesson.ruDescription}.`
      : `${lesson.order}-dars. ${lesson.uzName}.`;
    const voice = locale === 'ru' ? 'ru-RU-DmitryNeural' : 'uz-UZ-SardorNeural';
    
    execSync(`edge-tts --voice ${voice} --rate=-8% --text "${text.replace(/"/g, '\\"')}" --write-media ${audioPath}`, {
      timeout: 60000, stdio: 'pipe'
    });
    
    // 2. Duration
    const durOut = execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 ${audioPath}`, { encoding: 'utf8' });
    const duration = Math.max(6, Math.ceil(Number(durOut.trim() || '6')));
    
    // 3. Screenshot
    const shotPath = path.join(ROOT, 'public', lesson.screenshot || 'screenshots/dashboard.png');
    if (!fs.existsSync(shotPath)) return { success: false, error: 'Screenshot not found' };
    
    // 4. Coords
    const target = getButtonCoords(lesson);
    const startX = target.x < WIDTH / 2 ? clamp(target.x + 240, 96, WIDTH - 90) : clamp(target.x - 260, 54, WIDTH - 110);
    const startY = clamp(target.y + 140, 88, HEIGHT - 60);
    const moveEnd = Math.max(2.5, duration * 0.62);
    const zoomEnd = Math.max(3.5, duration * 0.82);
    const clickStart = Math.max(2.2, duration * 0.72);
    
    const work = path.join(TMP_DIR, `${lesson.order}-${locale}`);
    if (!fs.existsSync(work)) fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'title.txt'), locale === 'ru' ? lesson.ruName : lesson.uzName);
    
    const xExpr = `if(lt(t,${moveEnd}),${startX}+(${target.x - startX})*min(1\\,t/${moveEnd}),${target.x})`;
    const yExpr = `if(lt(t,${moveEnd}),${startY}+(${target.y - startY})*min(1\\,t/${moveEnd}),${target.y})`;
    const zoomExpr = `1+(${MAX_ZOOM - 1})*min(1\\,t/${zoomEnd})`;
    
    const filter = [
      `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease`,
      `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white`,
      'format=yuv420p',
      `drawbox=x=${target.x-55}:y=${target.y-19}:w=110:h=38:color=yellow@0.55:t=3:enable='between(t,${clickStart},${duration})'`,
      `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='●':fontsize=28:fontcolor=yellow:borderw=2:x='(${xExpr})-12':y='(${yExpr})-9'`,
      `drawtext=fontfile=${ffPath(FONT_BOLD)}:text='◎':fontsize=62:fontcolor=white@0.92:x='${target.x-25}':y='${target.y-27}':enable='between(t,${clickStart},${clickStart+0.3})'`,
      `scale=w='trunc(${WIDTH}*(${zoomExpr})/2)*2':h='trunc(${HEIGHT}*(${zoomExpr})/2)*2':eval=frame`,
      `crop=${WIDTH}:${HEIGHT}:x='max(0,min(iw-${WIDTH},${target.x}*(iw/${WIDTH})-${WIDTH}/2))':y='max(0,min(ih-${HEIGHT},${target.y}*(ih/${HEIGHT})-${HEIGHT}/2))'`,
      `drawbox=x=0:y=0:w=iw:h=58:color=black@0.44:t=fill`,
      `drawtext=fontfile=${ffPath(FONT_BOLD)}:textfile=${ffPath(path.join(work, 'title.txt'))}:fontsize=28:fontcolor=white:x=24:y=14`,
    ].join(',');
    
    // 5. Video
    execSync(`ffmpeg -y -threads 1 -loop 1 -framerate ${FPS} -t ${duration} -i ${shotPath} -i ${audioPath} -filter_complex "[0:v]${filter}[v]" -map "[v]" -map 1:a -r ${FPS} -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -b:a 96k -b:v 900k -shortest ${videoPath}`, {
      timeout: 120000, stdio: 'pipe'
    });
    
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    return { success: true, path: `/generated-videos/${base}.mp4` };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = parseInt(searchParams.get('from') || '1');
  const to = parseInt(searchParams.get('to') || '10');
  const locale = searchParams.get('locale') || 'ru';
  
  const filtered = lessons.filter(l => l.order >= from && l.order <= to);
  const results: any[] = [];
  
  for (const lesson of filtered) {
    const result = generateVideo(lesson, locale);
    results.push({ order: lesson.order, name: lesson.ruName, ...result });
    await new Promise(r => setTimeout(r, 300));
  }
  
  return NextResponse.json({
    generated: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  });
}
