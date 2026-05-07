import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/lessons - Get all lessons with user's progress
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lessons = await prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessonProgress: {
          where: { userId: session.sub },
          select: { viewedAt: true, completed: true },
        },
      },
    });

    return NextResponse.json({
      lessons: lessons.map((l) => ({
        id: l.id,
        order: l.order,
        category: l.category,
        screenshot: l.screenshot,
        videoUrl: l.videoUrl,
        ruName: l.ruName,
        uzName: l.uzName,
        ruDescription: l.ruDescription,
        uzDescription: l.uzDescription,
        ruFunctionality: l.ruFunctionality,
        uzFunctionality: l.uzFunctionality,
        ruSteps: l.ruSteps,
        uzSteps: l.uzSteps,
        ruTips: l.ruTips,
        uzTips: l.uzTips,
        ruUseCase: l.ruUseCase,
        uzUseCase: l.uzUseCase,
        uiLocation: l.uiLocation,
        viewed: l.lessonProgress.length > 0,
        completed: l.lessonProgress[0]?.completed || false,
        viewedAt: l.lessonProgress[0]?.viewedAt || null,
      })),
    });
  } catch (e: any) {
    console.error('LESSONS_GET_ERROR', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
