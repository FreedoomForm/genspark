import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST reorder lessons
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonIds } = body as { lessonIds: string[] };

    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return NextResponse.json({ error: 'Invalid lesson IDs' }, { status: 400 });
    }

    // Update order for each lesson
    const updates = lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
