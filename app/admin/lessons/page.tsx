import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AllLessonsView from '@/components/AllLessonsView';
import { Locale } from '@/lib/i18n';

export default async function AdminLessonsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const locale = 'ru' as Locale; // Default locale, could be from cookie/header

  return <AllLessonsView locale={locale} />;
}
