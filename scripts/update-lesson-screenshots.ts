// Update lessons with screenshots
// Run: npx ts-node scripts/update-lesson-screenshots.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of lesson name patterns to screenshots
const screenshotMapping: { pattern: string; screenshot: string }[] = [
  // Dashboard / Main
  { pattern: 'Главная', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Баланс', screenshot: 'screenshots/balance.png' },
  { pattern: 'Bosh sahifa', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Balans', screenshot: 'screenshots/balance.png' },
  
  // Products
  { pattern: 'Товары', screenshot: 'screenshots/products.png' },
  { pattern: 'Tovarlar', screenshot: 'screenshots/products.png' },
  { pattern: 'Добавить товар', screenshot: 'screenshots/products_new.png' },
  { pattern: 'Tovar qo\'shish', screenshot: 'screenshots/products_new.png' },
  { pattern: 'Карточка товара', screenshot: 'screenshots/products_page.png' },
  { pattern: 'Импорт товаров', screenshot: 'screenshots/import_products.png' },
  { pattern: 'Tovarlarni import', screenshot: 'screenshots/import_products.png' },
  { pattern: 'Избранные товары', screenshot: 'screenshots/favorite_products.png' },
  { pattern: 'Весовые товары', screenshot: 'screenshots/weighted_products.png' },
  
  // Inventory / Stock
  { pattern: 'Инвентаризация', screenshot: 'screenshots/inventory.png' },
  { pattern: 'Склад', screenshot: 'screenshots/products.png' },
  { pattern: 'Приход', screenshot: 'screenshots/receipt.png' },
  { pattern: 'Kirim', screenshot: 'screenshots/receipt.png' },
  { pattern: 'Возврат прихода', screenshot: 'screenshots/receipt_return.png' },
  { pattern: 'Трансфер', screenshot: 'screenshots/transfer.png' },
  { pattern: 'Transfer', screenshot: 'screenshots/transfer.png' },
  { pattern: 'Реализация', screenshot: 'screenshots/realization.png' },
  { pattern: 'Переоценка', screenshot: 'screenshots/reprice.png' },
  { pattern: 'Списание', screenshot: 'screenshots/writeoff.png' },
  { pattern: 'Группировка', screenshot: 'screenshots/grouping.png' },
  { pattern: 'Техкарты', screenshot: 'screenshots/tech_cards.png' },
  { pattern: 'Акт изготовления', screenshot: 'screenshots/manufacturing_act.png' },
  
  // Reference - Personnel
  { pattern: 'Персонал', screenshot: 'screenshots/personnel.png' },
  { pattern: 'Personal', screenshot: 'screenshots/personnel.png' },
  { pattern: 'Зарплата', screenshot: 'screenshots/salary.png' },
  { pattern: 'Maosh', screenshot: 'screenshots/salary.png' },
  
  // Reference - Clients
  { pattern: 'Клиенты', screenshot: 'screenshots/clients.png' },
  { pattern: 'Mijozlar', screenshot: 'screenshots/clients.png' },
  { pattern: 'Контрагенты', screenshot: 'screenshots/contractors.png' },
  { pattern: 'Kontragentlar', screenshot: 'screenshots/contractors.png' },
  
  // Reference - Promotions/Loyalty
  { pattern: 'Акции', screenshot: 'screenshots/promotions.png' },
  { pattern: 'Aksiyalar', screenshot: 'screenshots/promotions.png' },
  { pattern: 'Лояльность', screenshot: 'screenshots/loyalty.png' },
  { pattern: 'Sodiqlik', screenshot: 'screenshots/loyalty.png' },
  
  // Reference - Tags/Pricetags
  { pattern: 'Теги', screenshot: 'screenshots/tags.png' },
  { pattern: 'Ценники', screenshot: 'screenshots/pricetags.png' },
  { pattern: 'Печать ценник', screenshot: 'screenshots/print_pricetags.png' },
  
  // Finance - Checks
  { pattern: 'Чеки', screenshot: 'screenshots/sold_checks.png' },
  { pattern: 'Cheklar', screenshot: 'screenshots/sold_checks.png' },
  { pattern: 'Возврат чека', screenshot: 'screenshots/check_returns.png' },
  { pattern: 'Удалённые чеки', screenshot: 'screenshots/deleted_checks.png' },
  { pattern: 'Ожидающие чеки', screenshot: 'screenshots/pending_checks.png' },
  { pattern: 'Настройки чеков', screenshot: 'screenshots/checks_settings.png' },
  
  // Finance - Cash registers
  { pattern: 'Кассы', screenshot: 'screenshots/cash_registers.png' },
  { pattern: 'Kassalar', screenshot: 'screenshots/cash_registers.png' },
  { pattern: 'Смены', screenshot: 'screenshots/shifts.png' },
  { pattern: 'Z-отчёт', screenshot: 'screenshots/z_reports.png' },
  
  // Finance - Accounts
  { pattern: 'Счета', screenshot: 'screenshots/accounts.png' },
  { pattern: 'Hisoblar', screenshot: 'screenshots/accounts.png' },
  { pattern: 'Взаиморасчёты', screenshot: 'screenshots/mutual_settlements.png' },
  
  // Finance - Payment methods
  { pattern: 'Способы оплаты', screenshot: 'screenshots/payment_methods.png' },
  { pattern: 'To\'lov usullari', screenshot: 'screenshots/payment_methods.png' },
  
  // Reports
  { pattern: 'Отчёты', screenshot: 'screenshots/reports' },
  { pattern: 'Hisobotlar', screenshot: 'screenshots/reports' },
  { pattern: 'ABC-отчёт', screenshot: 'screenshots/abc_report.png' },
  { pattern: 'XYZ-отчёт', screenshot: 'screenshots/xyz_report.png' },
  { pattern: 'ABC/XYZ', screenshot: 'screenshots/abc_xyz_report.png' },
  { pattern: 'P&L', screenshot: 'screenshots/pl_report.png' },
  { pattern: 'Отчёт по продажам', screenshot: 'screenshots/sales_report.png' },
  { pattern: 'Отчёт по товарам', screenshot: 'screenshots/product_report.png' },
  { pattern: 'Материальный', screenshot: 'screenshots/material_report.png' },
  { pattern: 'Топ продаж', screenshot: 'screenshots/top_sales.png' },
  { pattern: 'Нет движения', screenshot: 'screenshots/no_movement.png' },
  { pattern: 'Аудит маркировки', screenshot: 'screenshots/marking_audit.png' },
  { pattern: 'Параметры отчёт', screenshot: 'screenshots/params_report.png' },
  
  // Settings
  { pattern: 'Настройки', screenshot: 'screenshots/interface.png' },
  { pattern: 'Sozlamalar', screenshot: 'screenshots/interface.png' },
  { pattern: 'Кассовые аппараты', screenshot: 'screenshots/devices.png' },
  { pattern: 'Драйверы', screenshot: 'screenshots/drivers.png' },
  { pattern: 'Документы', screenshot: 'screenshots/documents.png' },
  { pattern: 'Параметры', screenshot: 'screenshots/parameters.png' },
  { pattern: 'Ценообразование', screenshot: 'screenshots/pricing.png' },
  { pattern: 'Тарифы', screenshot: 'screenshots/tariffs.png' },
  { pattern: 'Подписки', screenshot: 'screenshots/subscriptions.png' },
  { pattern: 'Данные компании', screenshot: 'screenshots/company_data.png' },
  { pattern: 'ЭДО', screenshot: 'screenshots/edo.png' },
  
  // Cabinet
  { pattern: 'Кабинет', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Kabinet', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Профиль', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Пополнение', screenshot: 'screenshots/balance.png' },
  { pattern: 'To\'ldirish', screenshot: 'screenshots/balance.png' },
  { pattern: 'Выход', screenshot: 'screenshots/dashboard.png' },
  { pattern: 'Chiqish', screenshot: 'screenshots/dashboard.png' },
  
  // Telegram bot
  { pattern: 'Telegram', screenshot: 'screenshots/telegram_bot.png' },
  { pattern: 'SMS', screenshot: 'screenshots/sms_blast.png' },
  { pattern: 'SMS-шаблоны', screenshot: 'screenshots/sms_templates.png' },
];

async function main() {
  console.log('Updating lesson screenshots...');
  
  const lessons = await prisma.lesson.findMany();
  let updated = 0;
  
  for (const lesson of lessons) {
    const mapping = screenshotMapping.find(
      m => lesson.ruName.includes(m.pattern) || lesson.uzName.includes(m.pattern)
    );
    
    if (mapping) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { screenshot: mapping.screenshot },
      });
      updated++;
      console.log(`✓ ${lesson.ruName} -> ${mapping.screenshot}`);
    } else {
      // Default screenshot based on category
      const defaultScreenshots: Record<string, string> = {
        warehouse: 'screenshots/products.png',
        reference: 'screenshots/contractors.png',
        finance: 'screenshots/sold_checks.png',
        reports: 'screenshots/sales_report.png',
        settings: 'screenshots/interface.png',
        cabinet: 'screenshots/dashboard.png',
      };
      
      const defaultScreenshot = defaultScreenshots[lesson.category] || 'screenshots/dashboard.png';
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { screenshot: defaultScreenshot },
      });
      updated++;
      console.log(`○ ${lesson.ruName} -> ${defaultScreenshot} (default for ${lesson.category})`);
    }
  }
  
  console.log(`\nUpdated ${updated} lessons with screenshots.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
