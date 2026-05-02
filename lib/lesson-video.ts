import { Locale } from '@/lib/i18n';

export type LessonVideoMap = {
  ru?: string | null;
  uz?: string | null;
  default?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseLessonVideoMap(raw: string | null | undefined): LessonVideoMap | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const result: LessonVideoMap = {};
    if (typeof parsed.ru === 'string') result.ru = parsed.ru;
    if (typeof parsed.uz === 'string') result.uz = parsed.uz;
    if (typeof parsed.default === 'string') result.default = parsed.default;
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

export function resolveLessonVideoUrl(raw: string | null | undefined, locale: Locale): string | null {
  if (!raw) return null;

  const map = parseLessonVideoMap(raw);
  if (map) {
    return map[locale] || map.default || map.ru || map.uz || null;
  }

  return raw;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function isGitHubReleaseUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /github\.com\/.*\/releases\/download\//i.test(url);
}

export function buildYouTubeEmbedUrl(url: string, autoplay = false): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}${autoplay ? '?autoplay=1' : ''}`;
    }
  }

  return url;
}

// Get video source - handles GitHub Releases, YouTube, and direct URLs
export function getVideoSource(url: string | null | undefined): {
  type: 'youtube' | 'github-release' | 'direct' | 'none';
  url: string | null;
} {
  if (!url) {
    return { type: 'none', url: null };
  }

  if (isYouTubeUrl(url)) {
    return { type: 'youtube', url: buildYouTubeEmbedUrl(url) };
  }

  if (isGitHubReleaseUrl(url)) {
    return { type: 'github-release', url };
  }

  return { type: 'direct', url };
}
