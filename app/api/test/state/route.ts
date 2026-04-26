import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { publicQuestion, getQuestionById } from '@/lib/questions';

export const runtime = 'nodejs';

// Returns the current user's attempt state and the public version of each
// question in the attempt (without the correct index).
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { userId: session.sub },
      include: { answers: true },
    });
    if (!attempt) {
      return NextResponse.json({ status: 'not_started' });
    }

    const ids: number[] = JSON.parse(attempt.questionIds);
    const questions = ids
      .map((id) => getQuestionById(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map(publicQuestion);

    return NextResponse.json({
      status: attempt.finishedAt ? 'finished' : 'in_progress',
      attemptId: attempt.id,
      questions,
      answeredIds: attempt.answers.map((a) => a.questionId),
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      totalCount: attempt.totalCount,
      finishedAt: attempt.finishedAt,
    });
  } catch (e: any) {
    console.error('TEST_STATE_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
