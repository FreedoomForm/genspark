import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUESTIONS } from '@/lib/questions';

// Pick 20 unique random questions out of 200.
function pickRandom20(): number[] {
  const ids = QUESTIONS.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 20);
}

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.attempt.findUnique({ where: { userId: session.sub } });
  if (existing) {
    // Single attempt rule. If finished — block; if not finished — return existing.
    if (existing.finishedAt) {
      return NextResponse.json({ error: 'already_done' }, { status: 409 });
    }
    return NextResponse.json({
      attemptId: existing.id,
      questionIds: JSON.parse(existing.questionIds) as number[],
      correctCount: existing.correctCount,
      incorrectCount: existing.incorrectCount,
      totalCount: existing.totalCount,
    });
  }

  const ids = pickRandom20();
  const attempt = await prisma.attempt.create({
    data: {
      userId: session.sub,
      questionIds: JSON.stringify(ids),
      totalCount: 20,
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    questionIds: ids,
    correctCount: 0,
    incorrectCount: 0,
    totalCount: 20,
  });
}
