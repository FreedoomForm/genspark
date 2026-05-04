const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Screenshot keyword mappings (Russian name -> English filename keyword)
const screenshotMappings = {
  // Основные
  'главна': 'dashboard',
  'баланс': 'balance',
  'пополнени': 'balance',
  'профиль': 'interface',
  'выход': 'login_page',
  
  // Товары
  'товар': 'products',
  'поиск товаров': 'products',
  'фильтр по категории': 'products',
  'фильтр по складу': 'products',
  'редактировать товар': 'products_new',
  'удалить товар': 'products',
  'экспорт товаров': 'products',
  'карточка товара': 'product_report',
  'избранное': 'favorite_products',
  'массовое редактирова': 'products',
  'печать ценника': 'pricetags',
  'копировать товар': 'products',
  'история изменений': 'products',
  'штрих-код': 'products',
  
  // Приход
  'приход': 'documents',
  'создать приход': 'documents',
  'поставщик': 'contractors',
  'черновик': 'documents',
  'оформлен': 'documents',
  'печать прихода': 'documents',
  'удалить приход': 'documents',
  'фильтр приходов': 'documents',
  
  // Расход
  'расход': 'documents',
  'создать расход': 'documents',
  'клиент': 'clients',
  'фильтр расходов': 'documents',
  
  // Продажи
  'продаж': 'receipt',
  'чек': 'receipt',
  'касса': 'cash_registers',
  'смен': 'shifts',
  'возврат': 'receipt_return',
  'дисконт': 'loyalty',
  'скидк': 'loyalty',
  
  // Склад
  'склад': 'inventory',
  'инвентаризаци': 'inventory',
  'перемещени': 'transfer',
  'списани': 'writeoff',
  'оприходова': 'documents',
  
  // Отчеты
  'отчет': 'sales_report',
  'продаж отчет': 'sales_report',
  'товар отчет': 'product_report',
  'прибль': 'pl_report',
  'abc': 'abc_report',
  'xyz': 'xyz_report',
  
  // Маркировка
  'маркировк': 'marking_audit',
  'честный знак': 'marking_audit',
  
  // Деньги
  'деньг': 'balance',
  'кассир': 'cash_registers',
  'z-отчет': 'z_reports',
  
  // Настройки
  'настройк': 'parameters',
  'параметр': 'parameters',
  'компани': 'company_data',
  'пользовател': 'personnel',
  'роль': 'personnel',
  'устройств': 'devices',
  
  // CRM
  'crm': 'clients',
  'контрагент': 'contractors',
  'взаиморасчет': 'mutual_settlements',
  
  // Дополнительно
  'edo': 'edo',
  'эдо': 'edo',
  'sms': 'sms_blast',
  'telegram': 'telegram_bot',
  'подписк': 'subscriptions',
  'тариф': 'tariffs',
  
  // Производство
  'производств': 'manufacturing_act',
  'технологическ': 'tech_cards',
  
  // Другое
  'акци': 'promotions',
  'цен': 'pricing',
  'прайс': 'pricing',
  'этикетк': 'pricetags',
  'группировк': 'grouping',
  'импорт': 'import_products',
  'водител': 'drivers',
  'зарплат': 'salary',
  'чека возврат': 'check_returns',
  'чеки настройки': 'checks_settings',
  'удален чек': 'deleted_checks',
  'ожидающ чек': 'pending_checks',
  'продан чек': 'sold_checks',
  'оценк продаж': 'top_sales',
  'уведомлен': 'sms_templates',
  'отчет продаж': 'sales_report',
  'отчет чеков': 'receipt',
  'отчет прибыли': 'pl_report',
  'отчет ABC': 'abc_report',
  'отчет XYZ': 'xyz_report',
  'отчет по чекам': 'receipt',
  'отчет по товарам': 'product_report',
  'отчет по продажам': 'sales_report',
  'отчет по прибыли': 'pl_report',
  'отчет по сотрудникам': 'personnel',
  'отчет по кассирам': 'cash_registers',
  'отчет по клиентам': 'clients',
  'отчет по контрагентам': 'contractors',
  'отчет по складу': 'inventory',
  'чек без движения': 'no_movement',
  'чеки без движения': 'no_movement',
  'взвешенн товаров': 'weighted_products',
  'взвешивание': 'weighted_products',
  'метод оплат': 'payment_methods',
  'оплата': 'payment_methods',
  'реализац': 'realization',
  'переоценк': 'reprice',
  'печать этикеток': 'print_pricetags',
  'коды': 'tags',
  'теги': 'tags',
  'отчет материал': 'material_report',
  'отчет по чекам': 'receipt',
};

const SCREENSHOT_BASE_URL = 'https://raw.githubusercontent.com/FreedoomForm/genspark/main/public/screenshots/';
const VIDEO_BASE_URL = 'https://github.com/FreedoomForm/genspark/releases/download/lesson-videos/';

// Available screenshots from GitHub
const availableScreenshots = [
  'abc_report.png', 'abc_xyz_report.png', 'accounts.png', 'balance.png',
  'cash_registers.png', 'check_returns.png', 'checks_settings.png', 'clients.png',
  'company_data.png', 'contractors.png', 'dashboard.png', 'dashboard_full.png',
  'dashboard_new.png', 'deleted_checks.png', 'devices.png', 'documents.png',
  'drivers.png', 'edo.png', 'favorite_products.png', 'grouping.png',
  'import_products.png', 'interface.png', 'inventory.png', 'login_page.png',
  'loyalty.png', 'manufacturing_act.png', 'marking_audit.png', 'material_report.png',
  'mutual_settlements.png', 'no_movement.png', 'parameters.png', 'params_report.png',
  'payment_methods.png', 'pending_checks.png', 'personnel.png', 'pl_report.png',
  'pricetags.png', 'pricing.png', 'print_pricetags.png', 'product_report.png',
  'products.png', 'products_new.png', 'products_page.png', 'promotions.png',
  'realization.png', 'receipt.png', 'receipt_return.png', 'reprice.png',
  'salary.png', 'sales_report.png', 'shifts.png', 'sms_blast.png',
  'sms_templates.png', 'sold_checks.png', 'subscriptions.png', 'tags.png',
  'tariffs.png', 'tech_cards.png', 'telegram_bot.png', 'top_sales.png',
  'transfer.png', 'weighted_products.png', 'writeoff.png', 'xyz_report.png',
  'z_reports.png'
];

function findScreenshot(ruName, category) {
  if (!ruName) return null;
  
  const nameLower = ruName.toLowerCase();
  
  // Try exact keyword match
  for (const [keyword, filename] of Object.entries(screenshotMappings)) {
    if (nameLower.includes(keyword)) {
      // Find matching file
      const matchingFile = availableScreenshots.find(f => 
        f.replace('.png', '').replace(/_/g, '') === filename.replace(/_/g, '')
      );
      if (matchingFile) {
        return matchingFile;
      }
      // Try partial match
      const partialMatch = availableScreenshots.find(f => 
        f.includes(filename) || filename.includes(f.replace('.png', ''))
      );
      if (partialMatch) {
        return partialMatch;
      }
    }
  }
  
  // Fallback: try to match by category
  if (category) {
    const catLower = category.toLowerCase();
    for (const [keyword, filename] of Object.entries(screenshotMappings)) {
      if (catLower.includes(keyword)) {
        const matchingFile = availableScreenshots.find(f => 
          f.includes(filename)
        );
        if (matchingFile) {
          return matchingFile;
        }
      }
    }
  }
  
  return null;
}

async function main() {
  console.log('Fetching lessons from database...');
  
  const lessons = await prisma.$queryRaw`
    SELECT id, "order", category, "ruName", screenshot, "videoUrl"
    FROM lesson
    ORDER BY "order"
  `;
  
  console.log(`Found ${lessons.length} lessons`);
  
  let updated = 0;
  let screenshotFound = 0;
  let videoFound = 0;
  
  for (const lesson of lessons) {
    const order = Number(lesson.order);
    
    // Find screenshot
    const screenshotFile = findScreenshot(lesson.ruName, lesson.category);
    const screenshotUrl = screenshotFile ? `${SCREENSHOT_BASE_URL}${screenshotFile}` : null;
    
    // Generate video URL (only for lessons 1-200 with available videos)
    const videoUrl = order <= 200 ? `${VIDEO_BASE_URL}${String(order).padStart(3, '0')}-ru-lesson.mp4` : null;
    
    if (screenshotUrl || videoUrl) {
      await prisma.$executeRaw`
        UPDATE lesson
        SET screenshot = ${screenshotUrl}, "videoUrl" = ${videoUrl}
        WHERE id = ${lesson.id}
      `;
      updated++;
      if (screenshotUrl) screenshotFound++;
      if (videoUrl) videoFound++;
      
      console.log(`Order ${order}: ${lesson.ruName?.substring(0, 30)} - Screenshot: ${screenshotUrl ? 'YES' : 'NO'}, Video: ${videoUrl ? 'YES' : 'NO'}`);
    }
  }
  
  console.log(`\nUpdated ${updated} lessons`);
  console.log(`Screenshots found: ${screenshotFound}`);
  console.log(`Videos set: ${videoFound}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
