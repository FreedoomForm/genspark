'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale, t } from '@/lib/i18n';

function getLocaleClient(): Locale {
  if (typeof document === 'undefined') return 'ru';
  const m = document.cookie.match(/(?:^|; )locale=(ru|uz)/);
  return (m?.[1] as Locale) || 'ru';
}

export default function LoginPage() {
  const locale = getLocaleClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* server returned non-JSON */ }
      if (!res.ok) { setErr(data.error || t(locale, 'common_error')); return; }
      router.push(data.role === 'ADMIN' ? '/admin' : '/test');
      router.refresh();
    } catch {
      setErr(t(locale, 'common_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-lume-navy">{t(locale, 'auth_login_title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t(locale, 'app_subtitle')}</p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="label">{t(locale, 'auth_email')}</label>
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">{t(locale, 'auth_password')}</label>
            <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? t(locale, 'common_loading') : t(locale, 'auth_login_btn')}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          {t(locale, 'auth_no_account')}{' '}
          <Link className="text-lume-blue font-medium" href="/register">{t(locale, 'auth_register_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
