import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLocale } from '@/lib/i18n-server';
import { prisma } from '@/lib/db';
import TestRunner from '@/components/TestRunner';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function TestPage() {
  const session = await getSession();
  const locale = getLocale();
  if (!session) redirect('/login');
  if (session.role === 'ADMIN') redirect('/admin');

  // Show intro if no attempt yet, finished screen if done, or runner otherwise.
  const attempt = await prisma.attempt.findUnique({ where: { userId: session.sub } });

  if (attempt?.finishedAt) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold text-lume-navy">{t(locale, 'test_finished_title')}</h1>
          <p className="mt-2 text-gray-500">{t(locale, 'test_already_done')}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="text-3xl font-bold text-emerald-600">{attempt.correctCount}</div>
              <div className="text-xs text-emerald-700">{t(locale, 'test_score_correct')}</div>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <div className="text-3xl font-bold text-red-600">{attempt.incorrectCount}</div>
              <div className="text-xs text-red-700">{t(locale, 'test_score_incorrect')}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            {attempt.correctCount}/{attempt.totalCount}
          </div>
          <Link href="/" className="btn-secondary mt-6 inline-flex">{t(locale, 'test_back_home')}</Link>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-lume-navy">{t(locale, 'test_intro_title')}</h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(locale, 'test_intro_lead')}</p>
          <ul className="mt-4 space-y-1 text-sm text-gray-700">
            <li>• 20 / 200</li>
            <li>• {t(locale, 'landing_features_4_t')}</li>
          </ul>
          <TestRunner locale={locale} startMode="intro" />
        </div>
      </div>
    );
  }

  return <TestRunner locale={locale} startMode="resume" />;
}
