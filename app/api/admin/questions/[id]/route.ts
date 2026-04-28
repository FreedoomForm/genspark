import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// PUT - Update a single question
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const body = await req.json();
    const { category, screenshot, ruQuestion, ruOptions, uzQuestion, uzOptions, correct } = body;

    if (!category || !ruQuestion || !ruOptions || !uzQuestion || !uzOptions || correct === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        category,
        screenshot: screenshot || null,
        ruQuestion,
        ruOptions,
        uzQuestion,
        uzOptions,
        correct,
      },
    });

    return NextResponse.json({ question });
  } catch (e: any) {
    console.error('UPDATE_QUESTION_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message }, { status: 500 });
  }
}

// DELETE - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE_QUESTION_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message }, { status: 500 });
  }
}
