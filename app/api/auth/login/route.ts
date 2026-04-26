import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSession, getAdminCredentials, verifyPassword } from '@/lib/auth';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  admin: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  let parsed;
  try { parsed = Body.parse(await req.json()); }
  catch { return NextResponse.json({ error: 'Invalid input' }, { status: 400 }); }

  const email = parsed.email.toLowerCase().trim();

  if (parsed.admin) {
    const admin = getAdminCredentials();
    if (email === admin.email.toLowerCase() && parsed.password === admin.password) {
      await createSession({
        sub: 'admin',
        email: admin.email,
        name: 'Administrator',
        role: 'ADMIN',
      });
      return NextResponse.json({ ok: true, role: 'ADMIN' });
    }
    return NextResponse.json({ error: 'Неверный e-mail или пароль / E-mail yoki parol noto‘g‘ri' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Неверный e-mail или пароль / E-mail yoki parol noto‘g‘ri' }, { status: 401 });
  }
  const ok = await verifyPassword(parsed.password, user.password);
  if (!ok) {
    return NextResponse.json({ error: 'Неверный e-mail или пароль / E-mail yoki parol noto‘g‘ri' }, { status: 401 });
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role as 'USER' | 'ADMIN' });
  return NextResponse.json({ ok: true, role: user.role });
}
