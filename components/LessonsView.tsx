'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';
import LessonMediaPlayer from '@/components/LessonMediaPlayer';

type Lesson = {
  id: string;
  order: number;
  category: string;
  screenshot: string | null;
  videoUrl: string | null;
  ruName: string;
  uzName: string;
  ruDescription: string | null;
  uzDescription: string | null;
  ruFunctionality: string | null;
  uzFunctionality: string | null;
  ruSteps: string | null;
  uzSteps: string | null;
  ruTips: string | null;
  uzTips: string | null;
  ruUseCase: string | null;
  uzUseCase: string | null;
  uiLocation: string | null;
  viewed: boolean;
  completed: boolean;
  viewedAt: string | null;
};

type LightboxContent = {
  type: 'video' | 'image';
  src: string;
  title?: string;
} | null;

const categoryLabels: Record<string, { ru: string; uz: string }> = {
  warehouse: { ru: 'Складские операции', uz: 'Ombor operatsiyalari' },
  reference: { ru: 'Справочник', uz: "Ma'lumotnoma" },
  finance: { ru: 'Финансовые операции', uz: 'Moliya operatsiyalari' },
  reports: { ru: 'Отчёты', uz: 'Hisobotlar' },
  settings: { ru: 'Настройки', uz: 'Sozlamalar' },
  cabinet: { ru: 'Кабинет', uz: 'Kabinet' },
};

const categories = ['warehouse', 'reference', 'finance', 'reports', 'settings', 'cabinet'];

export default function LessonsView({ locale }: { locale: Locale }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxContent>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchLessons();
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset zoom when lightbox opens
  useEffect(() => {
    if (lightbox) setZoomLevel(100);
  }, [lightbox]);

  function zoomIn() {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  }

  function zoomOut() {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  }

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
    if (currentIndex < filteredLessons.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markLessonViewed(filteredLessons[nextIndex]);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  // Filter lessons based on category and search
  const filteredLessons = lessons.filter(l => {
    const matchesCategory = !selectedCategory || l.category === selectedCategory;
    const name = locale === 'uz' ? l.uzName : l.ruName;
    const description = locale === 'uz' ? l.uzDescription : l.ruDescription;
    const matchesSearch = !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  // Reset current index when filters change
  useEffect(() => {
    if (filteredLessons.length > 0 && currentIndex >= filteredLessons.length) {
      setCurrentIndex(0);
    }
  }, [selectedCategory, searchQuery]);

  const viewedCount = lessons.filter((l) => l.viewed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((viewedCount / totalLessons) * 100) : 0;
  const currentLesson = filteredLessons[currentIndex];

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

  if (!currentLesson) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← {t(locale, 'test_back_home')}
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input flex-1"
              placeholder={locale === 'uz' ? 'Darslarni qidirish...' : 'Поиск по урокам...'}
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

        <div className="card p-8 text-center text-gray-500">
          {locale === 'uz' ? 'Darslar topilmadi' : 'Уроки не найдены'}
        </div>
      </div>
    );
  }

  const name = locale === 'uz' ? currentLesson.uzName : currentLesson.ruName;
  const description = locale === 'uz' ? currentLesson.uzDescription : currentLesson.ruDescription;
  const functionality = locale === 'uz' ? currentLesson.uzFunctionality : currentLesson.ruFunctionality;
  const steps = locale === 'uz' ? currentLesson.uzSteps : currentLesson.ruSteps;
  const tips = locale === 'uz' ? currentLesson.uzTips : currentLesson.ruTips;
  const useCase = locale === 'uz' ? currentLesson.uzUseCase : currentLesson.ruUseCase;
  const catLabel = categoryLabels[currentLesson.category]?.[locale] || currentLesson.category;
  const hasVideo = Boolean(currentLesson.videoUrl);

  // Parse steps as array if it's JSON
  let stepsArray: string[] = [];
  if (steps) {
    try {
      stepsArray = JSON.parse(steps);
    } catch {
      stepsArray = steps.split('\n').filter(s => s.trim());
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← {t(locale, 'test_back_home')}
        </Link>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {filteredLessons.length}
          {selectedCategory && (
            <span className="ml-2 text-lume-purple">
              ({categoryLabels[selectedCategory]?.[locale] || selectedCategory})
            </span>
          )}
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

      {/* Filters toggle button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full p-3 flex items-center justify-between text-sm hover:bg-gray-100 hover:shadow transition-all"
      >
        <span className="font-medium text-lume-navy">
          {locale === 'uz' ? 'Qidiruv va kategoriyalar' : 'Поиск и категории'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input flex-1"
              placeholder={locale === 'uz' ? 'Darslarni qidirish...' : 'Поиск по урокам...'}
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
          <div className="mt-2 text-xs text-gray-400">
            {locale === 'uz'
              ? `Topildi: ${filteredLessons.length} ta dars`
              : `Найдено: ${filteredLessons.length} уроков`}
          </div>
        </div>
      )}

      {/* Lesson card */}
      <div className="card p-6">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="category-badge">
            {catLabel}
          </span>
          {currentLesson.viewed && (
            <span className="badge-green text-xs">
              {locale === 'uz' ? "Ko'rilgan" : 'Просмотрено'}
            </span>
          )}
          {currentLesson.videoUrl && (
            <span className="badge-blue text-xs inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {locale === 'uz' ? 'Video' : 'Видео'}
            </span>
          )}
        </div>

        {/* UI Location */}
        {currentLesson.uiLocation && (
          <div className="mb-3">
            <span className="location-badge">
              📍 {currentLesson.uiLocation}
            </span>
          </div>
        )}

        {/* Name */}
        <h2 className="text-xl font-bold text-lume-navy mb-3">{name}</h2>

        {/* Video and Screenshot side by side */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          {/* Video player */}
          {hasVideo && (
            <div 
              className="md:w-1/2 cursor-pointer group"
              onClick={() => setLightbox({ type: 'video', src: currentLesson.videoUrl!, title: name })}
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 group-hover:ring-2 group-hover:ring-lume-purple transition-all bg-black">
                <LessonMediaPlayer videoUrl={currentLesson.videoUrl} locale={locale} title={name} preview />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* Screenshot */}
          <div className={hasVideo ? 'md:w-1/2' : 'w-full'}>
            {currentLesson.screenshot ? (
              <div 
                className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                onClick={() => setLightbox({ type: 'image', src: currentLesson.screenshot!, title: name })}
              >
                <img
                  src={`/${currentLesson.screenshot}`}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{locale === 'uz' ? 'Skrenshot yo‘q' : 'Нет скриншота'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {description && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-lume-navy text-white flex items-center justify-center text-xs">1</span>
              {locale === 'uz' ? 'Tavsif' : 'Описание'}
            </h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Functionality Section */}
        {functionality && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              {locale === 'uz' ? 'Funksionallik' : 'Функциональность'}
            </h3>
            <p className="text-blue-800 leading-relaxed">{functionality}</p>
          </div>
        )}

        {/* Steps Section */}
        {stepsArray.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">3</span>
              {locale === 'uz' ? 'Bosqichma-bosqich ko\'rsatmalar' : 'Пошаговая инструкция'}
            </h3>
            <ol className="space-y-2">
              {stepsArray.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-green-800 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Use Case Section */}
        {useCase && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">4</span>
              {locale === 'uz' ? 'Qachon foydalaniladi' : 'Когда используется'}
            </h3>
            <p className="text-purple-800 leading-relaxed">{useCase}</p>
          </div>
        )}

        {/* Tips Section */}
        {tips && (
          <div className="mb-4 p-4 bg-amber-50 rounded-lg">
            <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">💡</span>
              {locale === 'uz' ? 'Maslahatlar va tavsiyalar' : 'Советы и рекомендации'}
            </h3>
            <p className="text-amber-800 leading-relaxed">{tips}</p>
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

          {currentIndex < filteredLessons.length - 1 ? (
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

      {/* Lesson navigation with numbers */}
      <div className="mt-1">
        <div className="text-[9px] text-gray-400 mb-0.5 text-center">
          {locale === 'uz' ? "Darslarga o'tish:" : 'Перейти к уроку:'}
        </div>
        <div className="overflow-x-auto rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-1.5 py-1 drop-shadow-sm">
          <div className="flex justify-center gap-1" style={{ minWidth: 'max-content' }}>
            {filteredLessons.map((lesson, idx) => {
              const originalIdx = lessons.findIndex(l => l.id === lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    markLessonViewed(filteredLessons[idx]);
                  }}
                  title={locale === 'uz' ? lesson.uzName : lesson.ruName}
                  className={
                    idx === currentIndex
                      ? 'number-btn-active !w-5 !h-5 !text-[8px]'
                      : lesson.viewed
                      ? 'number-btn-viewed !w-5 !h-5 !text-[8px]'
                      : 'number-btn-default !w-5 !h-5 !text-[8px]'
                  }
                >
                  {originalIdx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="modal-close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            {lightbox.title && (
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-lume-navy truncate">{lightbox.title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="relative w-full aspect-video">
              {lightbox.type === 'video' ? (
                <LessonMediaPlayer
                  videoUrl={lightbox.src}
                  locale={locale}
                  title={lightbox.title || 'Video'}
                  autoplay
                />
              ) : (
                <>
                  {/* Zoom controls */}
                  <div className="zoom-controls">
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 50}
                      className="zoom-btn"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="zoom-indicator">{zoomLevel}%</span>
                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 300}
                      className="zoom-btn"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Scrollable image container */}
                  <div className="absolute inset-0 overflow-auto bg-gray-100">
                    <div 
                      className="min-w-full min-h-full flex items-center justify-center"
                      style={{
                        minWidth: `${zoomLevel}%`,
                        minHeight: `${zoomLevel}%`
                      }}
                    >
                      <img
                        src={`/${lightbox.src}`}
                        alt={lightbox.title || 'Image'}
                        className="max-w-none transition-transform duration-200"
                        style={{
                          width: `${zoomLevel}%`,
                          height: 'auto'
                        }}
                        draggable={false}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
