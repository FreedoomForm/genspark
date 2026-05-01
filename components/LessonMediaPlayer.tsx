'use client';

import { Locale } from '@/lib/i18n';
import { buildYouTubeEmbedUrl, isYouTubeUrl, resolveLessonVideoUrl } from '@/lib/lesson-video';

type Props = {
  videoUrl: string | null;
  locale: Locale;
  title: string;
  preview?: boolean;
  autoplay?: boolean;
  className?: string;
};

export default function LessonMediaPlayer({
  videoUrl,
  locale,
  title,
  preview = false,
  autoplay = false,
  className = '',
}: Props) {
  const resolvedUrl = resolveLessonVideoUrl(videoUrl, locale);

  if (!resolvedUrl) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <span className="text-sm">Видео недоступно</span>
      </div>
    );
  }

  if (isYouTubeUrl(resolvedUrl)) {
    return (
      <iframe
        src={buildYouTubeEmbedUrl(resolvedUrl, autoplay)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`absolute inset-0 h-full w-full ${preview ? 'pointer-events-none' : ''} ${className}`}
      />
    );
  }

  return (
    <video
      src={resolvedUrl}
      title={title}
      controls={!preview}
      autoPlay={autoplay && !preview}
      muted={preview || autoplay}
      playsInline
      preload="metadata"
      className={`absolute inset-0 h-full w-full bg-black ${preview ? 'pointer-events-none object-cover' : ''} ${className}`}
    />
  );
}
