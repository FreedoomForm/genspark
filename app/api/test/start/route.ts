import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUESTIONS } from '@/lib/questions';

export const runtime = 'nodejs';

// Pick 20 unique random questions out of 200.
function pickRandom20(): number[] {
  const ids = QUESTIONS.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 20);
}

// Generate shuffled indices for options (e.g., [2, 0, 3, 1] means option 2 is now at position 0)
function generateShuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// Get client IP address from request
function getClientIP(req: NextRequest): string {
  // Check various headers for IP (Vercel, proxies, etc.)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientIP = getClientIP(req);

    // Check if this IP has already had an attempt in the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ipAttemptThisMonth = await prisma.attempt.findFirst({
      where: {
        ipAddress: clientIP,
        startedAt: {
          gte: startOfMonth,
        },
      },
    });

    if (ipAttemptThisMonth) {
      return NextResponse.json({
        error: 'ip_limit_exceeded',
        message: 'Bu IP manzildan bu oyda allaqachon test topshirilgan. Keyingi oy qaytadan urinib ko\'ring.'
      }, { status: 429 });
    }

    const existing = await prisma.attempt.findUnique({ where: { userId: session.sub } });
    if (existing) {
      // Single attempt rule. If finished — block; if not finished — return existing.
      if (existing.finishedAt) {
        return NextResponse.json({ error: 'already_done' }, { status: 409 });
      }
      return NextResponse.json({
        attemptId: existing.id,
        questionIds: JSON.parse(existing.questionIds) as number[],
        correctCount: existing.correctCount,
        incorrectCount: existing.incorrectCount,
        totalCount: existing.totalCount,
      });
    }

    const ids = pickRandom20();

    // Generate shuffled options for each question
    const optionsShuffle: Record<number, number[]> = {};
    for (const id of ids) {
      const q = QUESTIONS.find(q => q.id === id);
      if (q) {
        optionsShuffle[id] = generateShuffledIndices(q.ru.opts.length);
      }
    }

    const attempt = await prisma.attempt.create({
      data: {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`,
        userId: session.sub,
        questionIds: JSON.stringify(ids),
        optionsShuffle: JSON.stringify(optionsShuffle),
        totalCount: 20,
        ipAddress: clientIP,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      questionIds: ids,
      correctCount: 0,
      incorrectCount: 0,
      totalCount: 20,
    });
  } catch (e: any) {
    console.error('TEST_START_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
