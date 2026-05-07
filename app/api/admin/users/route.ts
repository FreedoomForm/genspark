import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/admin/users?q=...
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
          role: 'USER' as const,
        }
      : { role: 'USER' as const };

    // Get total lessons count
    const totalLessons = await prisma.lesson.count();

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        attempt: true,
        _count: {
          select: { lessonProgress: true },
        },
      },
      take: 200,
    });

    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const finishedAttempts = await prisma.attempt.findMany({
      where: { finishedAt: { not: null } },
      select: { correctCount: true, totalCount: true },
    });
    const totalAttempts = finishedAttempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            (finishedAttempts.reduce((acc, a) => acc + (a.correctCount / Math.max(1, a.totalCount)) * 100, 0) /
              totalAttempts) * 10,
          ) / 10
        : 0;

    return NextResponse.json({
      totalUsers,
      totalAttempts,
      avgScore,
      totalLessons,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        attempt: u.attempt
          ? {
              correctCount: u.attempt.correctCount,
              incorrectCount: u.attempt.incorrectCount,
              totalCount: u.attempt.totalCount,
              startedAt: u.attempt.startedAt,
              finishedAt: u.attempt.finishedAt,
            }
          : null,
        lessonsViewed: u._count.lessonProgress,
      })),
    });
  } catch (e: any) {
    console.error('ADMIN_USERS_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
