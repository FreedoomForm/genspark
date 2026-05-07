import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// DELETE /api/admin/lessons/delete-all - Delete all lessons
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First delete all lesson progress (due to foreign key constraint)
    const progressDeleted = await prisma.lessonProgress.deleteMany({});
    console.log(`Deleted ${progressDeleted.count} lesson progress records`);

    // Then delete all lessons
    const lessonsDeleted = await prisma.lesson.deleteMany({});
    console.log(`Deleted ${lessonsDeleted.count} lessons`);

    return NextResponse.json({
      success: true,
      deleted: {
        progress: progressDeleted.count,
        lessons: lessonsDeleted.count,
      },
    });
  } catch (e: any) {
    console.error('DELETE_ALL_LESSONS_ERROR', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
