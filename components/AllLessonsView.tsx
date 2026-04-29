'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';

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
  uiLocation: string | null;
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

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export default function AllLessonsView({ locale }: { locale: Locale }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxContent>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  async function fetchLessons() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lessons');
      const data = await res.json();
      if (data.lessons) {
        setLessons(data.lessons);
      }
    } catch (e) {
      console.error('Failed to fetch lessons:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredLessons = lessons.filter(l => {
    const matchesCategory = !selectedCategory || l.category === selectedCategory;
    const name = locale === 'uz' ? l.uzName : l.ruName;
    const description = locale === 'uz' ? l.uzDescription : l.ruDescription;
    const matchesSearch = !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  // Drag and drop handlers
  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (draggedId === null || draggedId === id) return;
    setDragOverId(id);
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  async function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = lessons.findIndex(l => l.id === draggedId);
    const targetIndex = lessons.findIndex(l => l.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLessons = [...lessons];
    const [draggedLesson] = newLessons.splice(draggedIndex, 1);
    newLessons.splice(targetIndex, 0, draggedLesson);
    setLessons(newLessons);

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      const lessonIds = newLessons.map(l => l.id);
      try {
        await fetch('/api/admin/lessons/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonIds }),
        });
      } catch (e) {
        console.error('Failed to save order:', e);
      }
    }, 500);

    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  async function handleSaveLesson() {
    if (!editingLesson) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editingLesson.category,
          screenshot: editingLesson.screenshot,
          videoUrl: editingLesson.videoUrl,
          ruName: editingLesson.ruName,
          uzName: editingLesson.uzName,
          ruDescription: editingLesson.ruDescription,
          uzDescription: editingLesson.uzDescription,
          ruFunctionality: editingLesson.ruFunctionality,
          uzFunctionality: editingLesson.uzFunctionality,
          uiLocation: editingLesson.uiLocation,
        }),
      });
      if (res.ok) {
        await fetchLessons();
        setEditingLesson(null);
      } else {
        alert('Failed to save lesson');
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm(locale === 'uz' ? "Darsni o'chirishni xohlaysizmi?" : 'Вы уверены, что хотите удалить урок?')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchLessons();
      } else {
        alert('Failed to delete lesson');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete lesson');
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
            {locale === 'uz' ? 'Barcha darslar' : 'Все уроки'}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          {locale === 'uz' ? `Ko'rsatilmoqda: ${filteredLessons.length}` : `Показано: ${filteredLessons.length}`}
        </div>
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
        <p className="mt-2 text-xs text-gray-400">
          {locale === 'uz'
            ? 'Darslarni tartibini o\'zgartirish uchun ularni sudrab tashlang'
            : 'Перетащите уроки, чтобы изменить их порядок'}
        </p>
      </div>

      {/* Lessons list */}
      {loading ? (
        <div className="card p-8 text-center text-gray-500">
          {t(locale, 'common_loading')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => {
            const name = locale === 'uz' ? lesson.uzName : lesson.ruName;
            const description = locale === 'uz' ? lesson.uzDescription : lesson.ruDescription;
            const functionality = locale === 'uz' ? lesson.uzFunctionality : lesson.ruFunctionality;
            const catLabel = categoryLabels[lesson.category]?.[locale] || lesson.category;
            const isDragging = draggedId === lesson.id;
            const isDragOver = dragOverId === lesson.id;
            const videoId = getYouTubeVideoId(lesson.videoUrl);

            return (
              <div
                key={lesson.id}
                draggable
                onDragStart={() => handleDragStart(lesson.id)}
                onDragOver={(e) => handleDragOver(e, lesson.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, lesson.id)}
                onDragEnd={handleDragEnd}
                className={`card p-4 cursor-move transition-all ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${isDragOver ? 'ring-2 ring-lume-purple ring-offset-2' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag handle */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-sm font-bold flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Order number */}
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-lume-navy text-white text-sm font-bold flex items-center justify-center">
                    {lesson.order + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        {catLabel}
                      </span>
                      {lesson.uiLocation && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-lume-purple/10 text-lume-purple">
                          {lesson.uiLocation}
                        </span>
                      )}
                      {lesson.videoUrl && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                          YouTube
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-lume-navy mb-2">{name}</h3>

                    {/* Video and Screenshot side by side */}
                    <div className="mb-3 flex flex-col md:flex-row gap-3">
                      {/* Video player */}
                      {videoId && (
                        <div 
                          className="md:w-1/2 cursor-pointer group"
                          onClick={() => setLightbox({ type: 'video', src: videoId, title: name })}
                        >
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 group-hover:ring-2 group-hover:ring-lume-purple transition-all">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                              <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Screenshot */}
                      {lesson.screenshot && (
                        <div 
                          className={`${videoId ? 'md:w-1/2' : 'w-full'} cursor-pointer group`}
                          onClick={() => setLightbox({ type: 'image', src: lesson.screenshot!, title: name })}
                        >
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 group-hover:ring-2 group-hover:ring-lume-purple transition-all">
                            <img
                              src={`/${lesson.screenshot}`}
                              alt={name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-sm text-gray-600 mb-2">{description}</p>
                    )}

                    {/* Functionality */}
                    {functionality && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          {locale === 'uz' ? 'Funksionallik:' : 'Функциональность:'}
                        </p>
                        <p className="text-sm text-blue-800">{functionality}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setEditingLesson(lesson)}
                        className="btn-secondary text-sm !py-1.5 !px-3"
                      >
                        {locale === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-sm !py-1.5 !px-3 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        {locale === 'uz' ? "O'chirish" : 'Удалить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredLessons.length === 0 && !loading && (
        <div className="card p-8 text-center text-gray-500">
          {locale === 'uz' ? 'Darslar topilmadi' : 'Уроки не найдены'}
        </div>
      )}

      {/* Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-lume-navy">
                  {locale === 'uz' ? `Dars #${editingLesson.order + 1}` : `Урок #${editingLesson.order + 1}`}
                </h2>
                <button
                  onClick={() => setEditingLesson(null)}
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
                    value={editingLesson.category}
                    onChange={(e) => setEditingLesson({ ...editingLesson, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]?.[locale] || cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'YouTube video havolasi' : 'Ссылка на YouTube видео'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingLesson.videoUrl || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value || null })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {getYouTubeVideoId(editingLesson.videoUrl) && (
                    <div className="mt-2">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(editingLesson.videoUrl)}`}
                          title={locale === 'uz' ? editingLesson.uzName : editingLesson.ruName}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Skrenshot yo\'li' : 'Путь к скриншоту'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingLesson.screenshot || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, screenshot: e.target.value || null })}
                    placeholder="screenshots/example.png"
                  />
                  {editingLesson.screenshot && (
                    <img
                      src={`/${editingLesson.screenshot}`}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded border"
                    />
                  )}
                </div>

                {/* UI Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'UI dagi joylashuvi' : 'Расположение в UI'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingLesson.uiLocation || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, uiLocation: e.target.value || null })}
                    placeholder={locale === 'uz' ? 'Masalan: Bosh menyu -> Tovarlar' : 'Например: Главное меню -> Товары'}
                  />
                </div>

                {/* Russian Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Nomi (Ruscha)' : 'Название (Русский)'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingLesson.ruName}
                    onChange={(e) => setEditingLesson({ ...editingLesson, ruName: e.target.value })}
                  />
                </div>

                {/* Uzbek Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Nomi (O\'zbekcha)' : 'Название (Узбекский)'}
                  </label>
                  <input
                    className="input w-full"
                    value={editingLesson.uzName}
                    onChange={(e) => setEditingLesson({ ...editingLesson, uzName: e.target.value })}
                  />
                </div>

                {/* Russian Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Tavsif (Ruscha)' : 'Описание (Русский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingLesson.ruDescription || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, ruDescription: e.target.value || null })}
                  />
                </div>

                {/* Uzbek Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Tavsif (O\'zbekcha)' : 'Описание (Узбекский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingLesson.uzDescription || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, uzDescription: e.target.value || null })}
                  />
                </div>

                {/* Russian Functionality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Funksionallik (Ruscha)' : 'Функциональность (Русский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingLesson.ruFunctionality || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, ruFunctionality: e.target.value || null })}
                    placeholder={locale === 'uz' ? 'Bu tugma nima qiladi?' : 'Что делает эта кнопка/функция?'}
                  />
                </div>

                {/* Uzbek Functionality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'uz' ? 'Funksionallik (O\'zbekcha)' : 'Функциональность (Узбекский)'}
                  </label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    value={editingLesson.uzFunctionality || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, uzFunctionality: e.target.value || null })}
                    placeholder="Bu tugma nima qiladi?"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingLesson(null)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  {t(locale, 'common_cancel')}
                </button>
                <button
                  onClick={handleSaveLesson}
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
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-700 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <iframe
                  src={`https://www.youtube.com/embed/${lightbox.src}?autoplay=1`}
                  title={lightbox.title || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <img
                  src={`/${lightbox.src}`}
                  alt={lightbox.title || 'Image'}
                  className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
