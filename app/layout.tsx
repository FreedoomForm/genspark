import type { Metadata } from 'next';
import './globals.css';
import { getLocale } from '@/lib/i18n-server';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'LUME Quiz — Тест по admin.lume.uz',
  description: 'Платформа тестирования по системе администрирования lume.uz',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const session = await getSession();
  return (
    <html lang={locale}>
      <body>
        <Navbar locale={locale} session={session} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} LUME Quiz · Built for lume.uz knowledge testing
        </footer>
      </body>
    </html>
  );
}
