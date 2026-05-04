import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const {
      category,
      screenshot,
      videoUrl,
      videoUrlUz,
      ruName,
      uzName,
      ruDescription,
      uzDescription,
      ruFunctionality,
      uzFunctionality,
      uiLocation,
      order,
    } = body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        category,
        screenshot,
        videoUrl,
        videoUrlUz,
        ruName,
        uzName,
        ruDescription,
        uzDescription,
        ruFunctionality,
        uzFunctionality,
        uiLocation,
        order,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
