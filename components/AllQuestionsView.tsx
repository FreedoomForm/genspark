'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';
import type { Question } from '@/lib/questions';

const categoryLabels: Record<string, { ru: string; uz: string }> = {
  warehouse: { ru: 'Складские операции', uz: 'Ombor operatsiyalari' },
  reference: { ru: 'Справочник', uz: "Ma'lumotnoma" },
  finance: { ru: 'Финансовые операции', uz: 'Moliya operatsiyalari' },
  reports: { ru: 'Отчёты', uz: 'Hisobotlar' },
  settings: { ru: 'Настройки', uz: 'Sozlamalar' },
  cabinet: { ru: 'Кабинет', uz: 'Kabinet' },
};

export default function AllQuestionsView({ locale, questions }: { locale: Locale; questions: Question[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [...new Set(questions.map(q => q.cat))];

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = !selectedCategory || q.cat === selectedCategory;
    const text = locale === 'uz' ? q.uz : q.ru;
    const matchesSearch = !searchQuery ||
      text.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.opts.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-lume-navy">
            {locale === 'uz' ? 'Barcha savollar (200)' : 'Все вопросы (200)'}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          {locale === 'uz' ? `Ko'rsatilmoqda: ${filteredQuestions.length}` : `Показано: ${filteredQuestions.length}`}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <input
            className="input flex-1"
            placeholder={locale === 'uz' ? 'Savollarni qidirish...' : 'Поиск по вопросам...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Category filter */}
          <select
            className="input w-full sm:w-48"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">{locale === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {categoryLabels[cat]?.[locale] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const text = locale === 'uz' ? q.uz : q.ru;
          const correctAnswer = text.opts[q.correct];
          const catLabel = categoryLabels[q.cat]?.[locale] || q.cat;

          return (
            <div key={q.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-lume-navy text-white text-sm font-bold flex items-center justify-center">
                  {q.id}
                </span>
                <div className="flex-1 min-w-0">
                  {/* Category badge */}
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 mb-2">
                    {catLabel}
                  </span>

                  {/* Question */}
                  <h3 className="text-sm font-semibold text-lume-navy mb-3">{text.q}</h3>

                  {/* Screenshot */}
                  {q.shot && (
                    <div className="mb-3">
                      <img
                        src={`/${q.shot}`}
                        alt="Screenshot"
                        className="max-w-full h-auto rounded-lg border border-gray-200 max-h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-1.5">
                    {text.opts.map((opt, i) => {
                      const isCorrect = i === q.correct;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                            isCorrect
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && (
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          {locale === 'uz' ? 'Savollar topilmadi' : 'Вопросы не найдены'}
        </div>
      )}
    </div>
  );
}
