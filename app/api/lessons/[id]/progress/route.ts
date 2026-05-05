import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// POST /api/lessons/[id]/progress - Mark lesson as viewed/completed
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { completed } = body;

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.sub,
          lessonId: id,
        },
      },
      update: {
        viewedAt: new Date(),
        completed: completed ?? true,
      },
      create: {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`,
        userId: session.sub,
        lessonId: id,
        completed: completed ?? true,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (e: any) {
    console.error('LESSON_PROGRESS_ERROR', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
