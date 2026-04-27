import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLocale } from '@/lib/i18n-server';
import { QUESTIONS } from '@/lib/questions';
import AllQuestionsView from '@/components/AllQuestionsView';

export const dynamic = 'force-dynamic';

export default async function QuestionsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN') redirect('/test');
  const locale = getLocale();
  return <AllQuestionsView locale={locale} questions={QUESTIONS} />;
}
