import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const Body = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(6).max(120),
});

export async function POST(req: NextRequest) {
  try {
    let parsed;
    try { parsed = Body.parse(await req.json()); }
    catch { return NextResponse.json({ error: 'Invalid input' }, { status: 400 }); }

    const email = parsed.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Этот e-mail уже зарегистрирован / Bu e-mail allaqachon ro‘yxatdan o‘tgan' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.name.trim(),
        password: await hashPassword(parsed.password),
        role: 'USER',
      },
    });

    await createSession({ sub: user.id, email: user.email, name: user.name, role: 'USER' });

    return NextResponse.json({ ok: true, role: 'USER' });
  } catch (e: any) {
    console.error('REGISTER_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
