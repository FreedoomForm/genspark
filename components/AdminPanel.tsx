'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';

type Attempt = {
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  startedAt: string;
  finishedAt: string | null;
};
type UserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  attempt: Attempt | null;
};
type Resp = {
  totalUsers: number;
  totalAttempts: number;
  avgScore: number;
  users: UserRow[];
};

export default function AdminPanel({ locale }: { locale: Locale }) {
  const [data, setData] = useState<Resp | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounced search
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        const json = (await res.json()) as Resp;
        setData(json);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const sorted = useMemo(() => {
    if (!data) return [];
    // Show finished attempts first (descending by score), then in-progress, then not-started.
    const score = (u: UserRow) => {
      if (!u.attempt) return -2;
      if (!u.attempt.finishedAt) return -1;
      return (u.attempt.correctCount / Math.max(1, u.attempt.totalCount)) * 100;
    };
    return [...data.users].sort((a, b) => score(b) - score(a));
  }, [data]);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString(locale === 'uz' ? 'uz-UZ' : 'ru-RU');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-lume-navy">{t(locale, 'admin_title')}</h1>
        <div className="flex gap-2">
          <Link href="/admin/lessons" className="btn-secondary text-sm">
            {locale === 'uz' ? 'Barcha darslar' : 'Все уроки'}
          </Link>
          <Link href="/admin/questions" className="btn-primary text-sm">
            {t(locale, 'admin_see_all_tests')}
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">{t(locale, 'admin_total_users')}</div>
          <div className="mt-1 text-3xl font-bold text-lume-navy">{data?.totalUsers ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{t(locale, 'admin_total_attempts')}</div>
          <div className="mt-1 text-3xl font-bold text-lume-navy">{data?.totalAttempts ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{t(locale, 'admin_avg_score')}</div>
          <div className="mt-1 text-3xl font-bold text-lume-navy">{data ? `${data.avgScore}%` : '—'}</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          className="input"
          placeholder={t(locale, 'admin_search_placeholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">{t(locale, 'admin_th_name')}</th>
                <th className="px-4 py-3">{t(locale, 'admin_th_email')}</th>
                <th className="px-4 py-3">{t(locale, 'admin_th_score')}</th>
                <th className="px-4 py-3">{t(locale, 'admin_th_status')}</th>
                <th className="px-4 py-3">{t(locale, 'admin_th_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                    {t(locale, 'common_loading')}
                  </td>
                </tr>
              )}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                    {t(locale, 'admin_no_users')}
                  </td>
                </tr>
              )}
              {!loading &&
                sorted.map((u) => {
                  const a = u.attempt;
                  const status = !a
                    ? 'not_started'
                    : a.finishedAt
                    ? 'done'
                    : 'in_progress';
                  const pct = a ? Math.round((a.correctCount / Math.max(1, a.totalCount)) * 100) : null;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-lume-navy">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        {a ? (
                          <div className="inline-flex items-baseline gap-2">
                            <span className="font-bold text-lume-navy">
                              {a.correctCount}/{a.totalCount}
                            </span>
                            <span className="text-xs text-gray-400">({pct}%)</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {status === 'done' && (
                          <span className="badge-green">{t(locale, 'admin_status_done')}</span>
                        )}
                        {status === 'in_progress' && (
                          <span className="badge bg-amber-50 text-amber-700">{t(locale, 'admin_status_in_progress')}</span>
                        )}
                        {status === 'not_started' && (
                          <span className="badge-gray">{t(locale, 'admin_status_not_started')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {fmtDate(a?.finishedAt ?? a?.startedAt ?? u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
