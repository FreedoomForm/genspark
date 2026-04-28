// JWT-based session via the `jose` library, stored in an httpOnly cookie.
// We avoid NextAuth to keep the surface minimal and Vercel-friendly.

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'lume_session';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || 'dev-only-secret-change-me-please-please-please';
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  sub: string;             // user id (or 'admin' for admin login)
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(getSecretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub === 'string' &&
      typeof (payload as any).email === 'string' &&
      typeof (payload as any).name === 'string' &&
      ((payload as any).role === 'USER' || (payload as any).role === 'ADMIN')
    ) {
      return {
        sub: payload.sub,
        email: (payload as any).email,
        name: (payload as any).name,
        role: (payload as any).role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@lumequiz.local',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };
}
