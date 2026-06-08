import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'KULKAS_PINTAR_SECRET_KEY_2026_MVP';
const COOKIE_NAME = 'auth_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashed);
  } catch (error) {
    return false;
  }
}

export function signToken(payload: { user_id: number }): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

export function verifyToken(token: string): { user_id: number } | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { user_id: number };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.user_id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
    });

    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}
