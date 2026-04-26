import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const attempt = await prisma.attempt.findUnique({ where: { userId: session.sub } });
  if (!attempt) return NextResponse.json({ error: 'no_attempt' }, { status: 400 });
  if (attempt.finishedAt) {
    return NextResponse.json({
      ok: true,
      finishedAt: attempt.finishedAt,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      totalCount: attempt.totalCount,
    });
  }
  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: { finishedAt: new Date() },
  });
  return NextResponse.json({
    ok: true,
    finishedAt: updated.finishedAt,
    correctCount: updated.correctCount,
    incorrectCount: updated.incorrectCount,
    totalCount: updated.totalCount,
  });
}
