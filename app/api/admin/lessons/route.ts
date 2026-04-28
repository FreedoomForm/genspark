import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all lessons
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lessons = await prisma.lesson.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      screenshot,
      ruName,
      uzName,
      ruDescription,
      uzDescription,
      ruFunctionality,
      uzFunctionality,
      uiLocation,
    } = body;

    if (!ruName || !uzName || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await prisma.lesson.aggregate({
      _max: { order: true },
    });
    const order = (maxOrder._max.order || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        order,
        category,
        screenshot,
        ruName,
        uzName,
        ruDescription,
        uzDescription,
        ruFunctionality,
        uzFunctionality,
        uiLocation,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
