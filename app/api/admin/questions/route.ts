import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUESTIONS } from '@/lib/questions';

export const runtime = 'nodejs';

// GET - Get all questions from database, or seed from code if empty
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let questions = await prisma.question.findMany({
      orderBy: { id: 'asc' }
    });

    // If no questions in DB, seed from code
    if (questions.length === 0) {
      const seedData = QUESTIONS.map(q => ({
        id: q.id,
        category: q.cat,
        screenshot: q.shot || null,
        ruQuestion: q.ru.q,
        ruOptions: q.ru.opts,
        uzQuestion: q.uz.q,
        uzOptions: q.uz.opts,
        correct: q.correct,
      }));

      await prisma.question.createMany({ data: seedData });
      questions = await prisma.question.findMany({ orderBy: { id: 'asc' } });
    }

    return NextResponse.json({ questions });
  } catch (e: any) {
    console.error('GET_QUESTIONS_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message }, { status: 500 });
  }
}

// POST - Create or update multiple questions (bulk update)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { questions } = body as {
      questions: Array<{
        id: number;
        category: string;
        screenshot?: string | null;
        ruQuestion: string;
        ruOptions: string[];
        uzQuestion: string;
        uzOptions: string[];
        correct: number;
      }>;
    };

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Upsert each question
    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          category: q.category,
          screenshot: q.screenshot || null,
          ruQuestion: q.ruQuestion,
          ruOptions: q.ruOptions,
          uzQuestion: q.uzQuestion,
          uzOptions: q.uzOptions,
          correct: q.correct,
        },
        create: {
          id: q.id,
          category: q.category,
          screenshot: q.screenshot || null,
          ruQuestion: q.ruQuestion,
          ruOptions: q.ruOptions,
          uzQuestion: q.uzQuestion,
          uzOptions: q.uzOptions,
          correct: q.correct,
        },
      });
    }

    return NextResponse.json({ success: true, count: questions.length });
  } catch (e: any) {
    console.error('POST_QUESTIONS_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message }, { status: 500 });
  }
}
