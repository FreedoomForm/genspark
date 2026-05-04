import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://admin.lume.uz';
const LOGIN = 'point@indev.uz';
const PASSWORD = 'secret';

// Pages to screenshot
const pages = [
  { path: '/settings/tariffs', file: 'tariffs.png', name: 'Тарифы' },
  { path: '/products/new', file: 'products_new.png', name: 'Добавление товара' },
  { path: '/finance/accounts', file: 'accounts.png', name: 'Счета' },
  { path: '/settings/payment-methods', file: 'payment_methods.png', name: 'Методы оплаты' },
  { path: '/staff', file: 'personnel.png', name: 'Персонал' },
  { path: '/products', file: 'products_page.png', name: 'Страница товаров' }
];

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ru-RU'
  });
  
  const page = await context.newPage();
  
  // Login
  console.log('Logging in to admin.lume.uz...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Fill login form
  await page.fill('input[placeholder="Электронная почта"]', LOGIN);
  await page.fill('input[placeholder="Пароль"]', PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for login
  await page.waitForTimeout(5000);
  console.log('Logged in!');
  
  // Take screenshots
  for (const p of pages) {
    console.log(`\nNavigating to: ${p.name} (${p.path})`);
    try {
      await page.goto(BASE_URL + p.path, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const outputPath = `/home/z/my-project/public/screenshots/${p.file}`;
      await page.screenshot({ path: outputPath, fullPage: false });
      
      const stats = fs.statSync(outputPath);
      console.log(`✓ Saved: ${p.file} (${stats.size} bytes)`);
    } catch (e) {
      console.log(`✗ Error: ${e.message}`);
    }
  }
  
  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
