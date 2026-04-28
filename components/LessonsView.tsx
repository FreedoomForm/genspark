'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';

type Lesson = {
  id: string;
  order: number;
  category: string;
  screenshot: string | null;
  ruName: string;
  uzName: string;
  ruDescription: string | null;
  uzDescription: string | null;
  ruFunctionality: string | null;
  uzFunctionality: string | null;
  uiLocation: string | null;
  viewed: boolean;
  completed: boolean;
  viewedAt: string | null;
};

const categoryLabels: Record<string, { ru: string; uz: string }> = {
  warehouse: { ru: 'Складские операции', uz: 'Ombor operatsiyalari' },
  reference: { ru: 'Справочник', uz: "Ma'lumotnoma" },
  finance: { ru: 'Финансовые операции', uz: 'Moliya operatsiyalari' },
  reports: { ru: 'Отчёты', uz: 'Hisobotlar' },
  settings: { ru: 'Настройки', uz: 'Sozlamalar' },
  cabinet: { ru: 'Кабинет', uz: 'Kabinet' },
};

export default function LessonsView({ locale }: { locale: Locale }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    setLoading(true);
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      if (data.lessons) {
        setLessons(data.lessons);
        // Find first unviewed lesson or start from beginning
        const firstUnviewed = data.lessons.findIndex((l: Lesson) => !l.viewed);
        setCurrentIndex(firstUnviewed >= 0 ? firstUnviewed : 0);
      }
    } catch (e) {
      console.error('Failed to fetch lessons:', e);
    } finally {
      setLoading(false);
    }
  }

  async function markLessonViewed(lesson: Lesson) {
    if (lesson.viewed) return;
    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id ? { ...l, viewed: true, completed: true, viewedAt: new Date().toISOString() } : l
        )
      );
    } catch (e) {
      console.error('Failed to mark lesson as viewed:', e);
    }
  }

  function goNext() {
    if (currentIndex < lessons.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markLessonViewed(lessons[nextIndex]);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  const viewedCount = lessons.filter((l) => l.viewed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((viewedCount / totalLessons) * 100) : 0;
  const currentLesson = lessons[currentIndex];

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center text-gray-500">{t(locale, 'common_loading')}</div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center text-gray-500">
          {locale === 'uz' ? 'Darslar topilmadi' : 'Уроки не найдены'}
        </div>
      </div>
    );
  }

  const name = locale === 'uz' ? currentLesson.uzName : currentLesson.ruName;
  const description = locale === 'uz' ? currentLesson.uzDescription : currentLesson.ruDescription;
  const functionality = locale === 'uz' ? currentLesson.uzFunctionality : currentLesson.ruFunctionality;
  const catLabel = categoryLabels[currentLesson.category]?.[locale] || currentLesson.category;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← {t(locale, 'test_back_home')}
        </Link>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {totalLessons}
        </span>
      </div>

      {/* Progress bar */}
      <div className="card p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            {locale === 'uz' ? `Ko'rilgan: ${viewedCount}/${totalLessons}` : `Просмотрено: ${viewedCount}/${totalLessons}`}
          </span>
          <span className="text-xs font-bold text-lume-purple">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-lume-purple transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Lesson card */}
      <div className="card p-6">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            {catLabel}
          </span>
          {currentLesson.viewed && (
            <span className="badge-green text-xs">
              {locale === 'uz' ? "Ko'rilgan" : 'Просмотрено'}
            </span>
          )}
        </div>

        {/* UI Location */}
        {currentLesson.uiLocation && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-lume-purple/10 text-lume-purple">
              📍 {currentLesson.uiLocation}
            </span>
          </div>
        )}

        {/* Name */}
        <h2 className="text-xl font-bold text-lume-navy mb-3">{name}</h2>

        {/* Screenshot */}
        <div className="mb-4">
          {currentLesson.screenshot ? (
            <img
              src={`/${currentLesson.screenshot}`}
              alt={name}
              className="w-full rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-full h-48 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{locale === 'uz' ? 'Skrenshot yo‘q' : 'Нет скриншота'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}

        {/* Functionality */}
        {functionality && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-xs font-medium text-blue-600 mb-1">
              {locale === 'uz' ? 'Funksionallik:' : 'Функциональность:'}
            </p>
            <p className="text-sm text-blue-800">{functionality}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`btn-secondary ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ← {locale === 'uz' ? 'Oldingi' : 'Назад'}
          </button>

          {currentIndex < lessons.length - 1 ? (
            <button onClick={goNext} className="btn-primary">
              {locale === 'uz' ? 'Keyingi' : 'Далее'} →
            </button>
          ) : (
            <Link href="/" className="btn-primary">
              {locale === 'uz' ? 'Tugatish' : 'Завершить'}
            </Link>
          )}
        </div>
      </div>

      {/* Lesson dots navigation */}
      <div className="flex justify-center gap-1 flex-wrap">
        {lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => {
              setCurrentIndex(idx);
              markLessonViewed(lessons[idx]);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-4 bg-lume-purple'
                : lesson.viewed
                ? 'bg-lume-purple/50'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
