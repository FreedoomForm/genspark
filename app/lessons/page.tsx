import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLocale } from '@/lib/i18n-server';
import LessonsView from '@/components/LessonsView';

export const dynamic = 'force-dynamic';

export default async function LessonsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'ADMIN') redirect('/admin/lessons');
  
  const locale = getLocale();
  return <LessonsView locale={locale} />;
}
