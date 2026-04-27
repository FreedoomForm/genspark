'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';

type Question = {
  id: number;
  category: string;
  screenshot: string | null;
  ruQuestion: string;
  ruOptions: string[];
  uzQuestion: string;
  uzOptions: string[];
  correct: number;
};

const categoryLabels: Record<string, { ru: string; uz: string }> = {
  warehouse: { ru: 'Складские операции', uz: 'Ombor operatsiyalari' },
  reference: { ru: 'Справочник', uz: "Ma'lumotnoma" },
  finance: { ru: 'Финансовые операции', uz: 'Moliya operatsiyalari' },
  reports: { ru: 'Отчёты', uz: 'Hisobotlar' },
  settings: { ru: 'Настройки', uz: 'Sozlamalar' },
  cabinet: { ru: 'Кабинет', uz: 'Kabinet' },
};

const categories = ['warehouse', 'reference', 'finance', 'reports', 'settings', 'cabinet'];

export default function AllQuestionsView({ locale }: { locale: Locale }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error('Failed to fetch questions:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = !selectedCategory || q.category === selectedCategory;
    const questionText = locale === 'uz' ? q.uzQuestion : q.ruQuestion;
    const options = locale === 'uz' ? q.uzOptions : q.ruOptions;
    const matchesSearch = !searchQuery ||
      questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  async function handleSaveQuestion() {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editingQuestion.category,
          screenshot: editingQuestion.screenshot,
          ruQuestion: editingQuestion.ruQuestion,
          ruOptions: editingQuestion.ruOptions,
          uzQuestion: editingQuestion.uzQuestion,
          uzOptions: editingQuestion.uzOptions,
          correct: editingQuestion.correct,
        }),
      });
      if (res.ok) {
        await fetchQuestions();
        setEditingQuestion(null);
      } else {
        alert('Failed to save question');
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  }

  function updateOption(lang: 'ru' | 'uz', index: number, value: string) {
    if (!editingQuestion) return;
    if (lang === 'ru') {
      const newOpts = [...editingQuestion.ruOptions];
      newOpts[index] = value;
      setEditingQuestion({ ...editingQuestion, ruOptions: newOpts });
    } else {
      const newOpts = [...editingQuestion.uzOptions];
      newOpts[index] = value;
      setEditingQuestion({ ...editingQuestion, uzOptions: newOpts });
    }
  }

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
          <input
            className="input flex-1"
            placeholder={locale === 'uz' ? 'Savollarni qidirish...' : 'Поиск по вопросам...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      {loading ? (
        <div className="card p-8 text-center text-gray-500">
          {t(locale, 'common_loading')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const questionText = locale === 'uz' ? q.uzQuestion : q.ruQuestion;
            const options = locale === 'uz' ? q.uzOptions : q.ruOptions;
            const catLabel = categoryLabels[q.category]?.[locale] || q.category;

            return (
              <div key={q.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-lume-navy text-white text-sm font-bold flex items-center justify-center">
                    {q.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        {catLabel}
                      </span>
                    </div>

                    {/* Question */}
                    <h3 className="text-sm font-semibold text-lume-navy mb-3">{questionText}</h3>

                    {/* Screenshot */}
                    {q.screenshot && (
                      <div className="mb-3">
                        <img
                          src={`/${q.screenshot}`}
                          alt="Screenshot"
                          className="max-w-full h-auto rounded-lg border border-gray-200 max-h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-1.5">
                      {options.map((opt, i) => {
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

                    {/* Edit button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="btn-secondary text-sm !py-1.5 !px-3"
                      >
                        {locale === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredQuestions.length === 0 && !loading && (
        <div className="card p-8 text-center text-gray-500">
          {locale === 'uz' ? 'Savollar topilmadi' : 'Вопросы не найдены'}
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-lume-navy">
                  {locale === 'uz' ? `Savol #${editingQuestion.id}` : `Вопрос #${editingQuestion.id}`}
                </h2>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Kategoriya' : 'Категория'}
                  </label>
                  <select
                    className="input w-full"
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]?.[locale] || cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Screenshot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Skrenshot yo\'li' : 'Путь к скриншоту'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingQuestion.screenshot || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, screenshot: e.target.value || null })}
                    placeholder="screenshots/example.png"
                  />
                  {editingQuestion.screenshot && (
                    <img
                      src={`/${editingQuestion.screenshot}`}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded border"
                    />
                  )}
                </div>

                {/* Russian Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Savol (Ruscha)' : 'Вопрос (Русский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingQuestion.ruQuestion}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, ruQuestion: e.target.value })}
                  />
                </div>

                {/* Russian Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Javoblar (Ruscha)' : 'Варианты (Русский)'}
                  </label>
                  {editingQuestion.ruOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        className="input flex-1"
                        value={opt}
                        onChange={(e) => updateOption('ru', i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Uzbek Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Savol (O\'zbekcha)' : 'Вопрос (Узбекский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingQuestion.uzQuestion}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, uzQuestion: e.target.value })}
                  />
                </div>

                {/* Uzbek Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Javoblar (O\'zbekcha)' : 'Варианты (Узбекский)'}
                  </label>
                  {editingQuestion.uzOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        className="input flex-1"
                        value={opt}
                        onChange={(e) => updateOption('uz', i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'To\'g\'ri javob' : 'Правильный ответ'}
                  </label>
                  <select
                    className="input w-full"
                    value={editingQuestion.correct}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct: parseInt(e.target.value) })}
                  >
                    {editingQuestion.ruOptions.map((_, i) => (
                      <option key={i} value={i}>
                        {String.fromCharCode(65 + i)} - {editingQuestion.ruOptions[i]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  {t(locale, 'common_cancel')}
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? t(locale, 'common_loading') : t(locale, 'common_save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
