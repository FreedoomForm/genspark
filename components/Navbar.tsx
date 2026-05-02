'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale, t } from '@/lib/i18n';
import type { SessionUser } from '@/lib/auth';

export default function Navbar({ locale, session }: { locale: Locale; session: SessionUser | null }) {
  const router = useRouter();

  const setLocale = (l: Locale) => {
    document.cookie = `locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="logo-container">L</div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-lume-navy tracking-wide">LUME QUIZ</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400">admin.lume.uz</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {session?.role === 'USER' && (
            <>
              <Link href="/lessons" className="btn-secondary !py-2 !px-4 text-sm hidden sm:inline-flex">
                {locale === 'uz' ? 'Darslar' : 'Уроки'}
              </Link>
              <Link href="/test" className="btn-primary !py-2 !px-4 text-sm hidden sm:inline-flex">
                {t(locale, 'nav_test')}
              </Link>
            </>
          )}

          {session && (
            <button onClick={logout} className="btn-secondary !py-2 !px-4 text-sm">
              {t(locale, 'nav_logout')}
            </button>
          )}

          <div className="ml-2 lang-toggle">
            <button
              onClick={() => setLocale('ru')}
              className={`lang-toggle-btn ${locale === 'ru' ? 'lang-toggle-btn-active' : 'lang-toggle-btn-inactive'}`}
            >
              RU
            </button>
            <button
              onClick={() => setLocale('uz')}
              className={`lang-toggle-btn ${locale === 'uz' ? 'lang-toggle-btn-active' : 'lang-toggle-btn-inactive'}`}
            >
              UZ
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
