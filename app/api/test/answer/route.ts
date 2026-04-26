import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getQuestionById } from '@/lib/questions';

const Body = z.object({
  questionId: z.number().int().positive(),
  selected: z.number().int().min(0).max(10),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed;
  try { parsed = Body.parse(await req.json()); }
  catch { return NextResponse.json({ error: 'Invalid input' }, { status: 400 }); }

  const attempt = await prisma.attempt.findUnique({ where: { userId: session.sub } });
  if (!attempt) return NextResponse.json({ error: 'no_attempt' }, { status: 400 });
  if (attempt.finishedAt) return NextResponse.json({ error: 'already_done' }, { status: 409 });

  const allowedIds: number[] = JSON.parse(attempt.questionIds);
  if (!allowedIds.includes(parsed.questionId)) {
    return NextResponse.json({ error: 'question_not_in_attempt' }, { status: 400 });
  }

  // Reject duplicate answers for the same question (idempotent-ish).
  const existing = await prisma.answer.findUnique({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: parsed.questionId } },
  });
  if (existing) {
    return NextResponse.json({
      isCorrect: existing.isCorrect,
      correctIndex: getQuestionById(parsed.questionId)?.correct ?? -1,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      totalCount: attempt.totalCount,
      duplicate: true,
    });
  }

  const q = getQuestionById(parsed.questionId);
  if (!q) return NextResponse.json({ error: 'unknown_question' }, { status: 400 });

  const isCorrect = parsed.selected === q.correct;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.answer.create({
      data: {
        attemptId: attempt.id,
        questionId: parsed.questionId,
        selected: parsed.selected,
        isCorrect,
      },
    });
    return tx.attempt.update({
      where: { id: attempt.id },
      data: {
        correctCount: { increment: isCorrect ? 1 : 0 },
        incorrectCount: { increment: isCorrect ? 0 : 1 },
      },
    });
  });

  // Auto-finish when 20 answered.
  const answered = updated.correctCount + updated.incorrectCount;
  if (answered >= updated.totalCount && !updated.finishedAt) {
    await prisma.attempt.update({
      where: { id: updated.id },
      data: { finishedAt: new Date() },
    });
  }

  return NextResponse.json({
    isCorrect,
    correctIndex: q.correct,
    correctCount: updated.correctCount,
    incorrectCount: updated.incorrectCount,
    totalCount: updated.totalCount,
  });
}
