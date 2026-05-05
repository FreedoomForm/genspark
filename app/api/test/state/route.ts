import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getQuestionById } from '@/lib/questions';

export const runtime = 'nodejs';

type ShuffledQuestion = {
  id: number;
  cat: string;
  shot?: string;
  ru: { q: string; opts: string[] };
  uz: { q: string; opts: string[] };
  shuffledCorrectIndex: number; // The correct answer's position after shuffling
};

// Apply shuffle to question options
function applyShuffle(
  question: ReturnType<typeof getQuestionById>,
  shuffleOrder: number[]
): ShuffledQuestion | null {
  if (!question) return null;

  // shuffleOrder[i] = original index that should be at position i
  // So shuffledOptions[i] = originalOptions[shuffleOrder[i]]
  const shuffledRuOpts = shuffleOrder.map(i => question.ru.opts[i]);
  const shuffledUzOpts = shuffleOrder.map(i => question.uz.opts[i]);

  // Find where the correct answer ended up
  // If original correct index is 2, and shuffleOrder = [1, 2, 0, 3]
  // Then correct answer is at position 1 (because shuffleOrder[1] = 2)
  const shuffledCorrectIndex = shuffleOrder.indexOf(question.correct);

  return {
    id: question.id,
    cat: question.cat,
    shot: question.shot,
    ru: { q: question.ru.q, opts: shuffledRuOpts },
    uz: { q: question.uz.q, opts: shuffledUzOpts },
    shuffledCorrectIndex,
  };
}

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
      include: { Answer: true },
    });
    if (!attempt) {
      return NextResponse.json({ status: 'not_started' });
    }

    const ids: number[] = JSON.parse(attempt.questionIds);
    const optionsShuffle: Record<number, number[]> = JSON.parse(attempt.optionsShuffle || '{}');

    const questions: ShuffledQuestion[] = ids
      .map((id) => {
        const q = getQuestionById(id);
        const shuffle = optionsShuffle[id] || Array.from({ length: q?.ru.opts.length || 4 }, (_, i) => i);
        return applyShuffle(q, shuffle);
      })
      .filter((q): q is ShuffledQuestion => Boolean(q));

    // For public view, remove the correct index but keep shuffled options
    const publicQuestions = questions.map(q => ({
      id: q.id,
      cat: q.cat,
      shot: q.shot,
      ru: q.ru,
      uz: q.uz,
    }));

    return NextResponse.json({
      status: attempt.finishedAt ? 'finished' : 'in_progress',
      attemptId: attempt.id,
      questions: publicQuestions,
      answeredIds: attempt.Answer.map((a) => a.questionId),
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
