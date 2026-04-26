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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lume-navy text-white font-bold">L</div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-lume-navy tracking-wide">LUME QUIZ</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400">admin.lume.uz</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {session?.role === 'USER' && (
            <Link href="/test" className="hidden sm:inline-block px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">
              {t(locale, 'nav_test')}
            </Link>
          )}
          {session?.role === 'ADMIN' && (
            <Link href="/admin" className="hidden sm:inline-block px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">
              {t(locale, 'nav_admin')}
            </Link>
          )}

          {!session && (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">
                {t(locale, 'nav_login')}
              </Link>
              <Link href="/register" className="btn-primary">
                {t(locale, 'nav_register')}
              </Link>
            </>
          )}

          {session && (
            <>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {session.name}
              </span>
              <button onClick={logout} className="btn-secondary !py-1.5 !px-3 text-xs">
                {t(locale, 'nav_logout')}
              </button>
            </>
          )}

          <div className="ml-2 inline-flex rounded-full border border-gray-200 bg-white p-0.5 text-xs">
            <button
              onClick={() => setLocale('ru')}
              className={`px-2 py-0.5 rounded-full ${locale === 'ru' ? 'bg-lume-navy text-white' : 'text-gray-600'}`}
            >
              RU
            </button>
            <button
              onClick={() => setLocale('uz')}
              className={`px-2 py-0.5 rounded-full ${locale === 'uz' ? 'bg-lume-navy text-white' : 'text-gray-600'}`}
            >
              UZ
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
