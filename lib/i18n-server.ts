import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, Locale, LOCALES, t as translate } from './i18n';

export function getLocale(): Locale {
  const c = cookies().get('locale')?.value as Locale | undefined;
  if (c && LOCALES.includes(c)) return c;
  return DEFAULT_LOCALE;
}

export function tt(key: string): string {
  return translate(getLocale(), key);
}
