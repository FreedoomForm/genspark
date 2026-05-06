export function isAbsoluteUrl(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export function resolveLessonImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isAbsoluteUrl(value)) return value;
  if (value.startsWith('/')) return value;
  return `/${value}`;
}
