import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    clearSession();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('LOGOUT_ERROR', e);
    return NextResponse.json({ error: 'Internal server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
