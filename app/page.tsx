import Link from 'next/link';
import { getLocale, tt } from '@/lib/i18n-server';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const locale = getLocale();
  const session = await getSession();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            admin.lume.uz · {locale.toUpperCase()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-lume-navy leading-tight">
            {tt('landing_title')}
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">{tt('landing_lead')}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {session?.role === 'USER' && (
              <Link href="/test" className="btn-primary">{tt('nav_test')}</Link>
            )}
            {session?.role === 'ADMIN' && (
              <Link href="/admin" className="btn-primary">{tt('nav_admin')}</Link>
            )}
            {!session && (
              <>
                <Link href="/register" className="btn-primary">{tt('landing_cta_register')}</Link>
                <Link href="/login" className="btn-secondary">{tt('landing_cta_login')}</Link>
              </>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            LUME ADMIN SYSTEM
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { t: 'Главная', d: 'Начало работы' },
              { t: 'Складские операции', d: 'Товары, приход, инвентаризация' },
              { t: 'Справочник', d: 'Персонал, клиенты, акции' },
              { t: 'Финансовые операции', d: 'Чеки, зарплата, взаиморасчёт' },
              { t: 'Отчеты', d: 'P&L, ABC/XYZ, продажи' },
              { t: 'Настройки', d: 'Кассы, теги, телеграм-бот' },
            ].map((s) => (
              <div key={s.t} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="text-sm font-semibold text-lume-navy">{s.t}</div>
                <div className="text-xs text-gray-500">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { t: tt('landing_features_1_t'), d: tt('landing_features_1_d'), c: 'bg-blue-50 text-blue-700' },
          { t: tt('landing_features_2_t'), d: tt('landing_features_2_d'), c: 'bg-emerald-50 text-emerald-700' },
          { t: tt('landing_features_3_t'), d: tt('landing_features_3_d'), c: 'bg-amber-50 text-amber-700' },
          { t: tt('landing_features_4_t'), d: tt('landing_features_4_d'), c: 'bg-rose-50 text-rose-700' },
        ].map((f) => (
          <div key={f.t} className="card p-5">
            <div className={`badge ${f.c}`}>•</div>
            <h3 className="mt-2 text-base font-semibold text-lume-navy">{f.t}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
