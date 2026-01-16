import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// JWT_SECRET 환경변수 검증
const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
  throw new Error(
    'JWT_SECRET environment variable is required. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}

if (JWT_SECRET_ENV.length < 32) {
  throw new Error(
    'JWT_SECRET must be at least 32 characters long for security'
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_ENV);

interface AuthData {
  username: string;
  passwordHash: string;
}

// 관리자 계정 환경변수 검증
const ADMIN_USERNAME_ENV = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH_ENV = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_USERNAME_ENV || !ADMIN_PASSWORD_HASH_ENV) {
  throw new Error(
    'ADMIN_USERNAME and ADMIN_PASSWORD_HASH environment variables are required'
  );
}

// 저장된 인증 정보 가져오기 (환경변수에서만)
export function getStoredAuth(): AuthData {
  return {
    username: ADMIN_USERNAME_ENV!,
    passwordHash: ADMIN_PASSWORD_HASH_ENV!,
  };
}

// 비밀번호 강도 검증
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase) {
    return { valid: false, error: '비밀번호는 최소 1개의 대문자를 포함해야 합니다.' };
  }

  if (!hasLowerCase) {
    return { valid: false, error: '비밀번호는 최소 1개의 소문자를 포함해야 합니다.' };
  }

  if (!hasNumber) {
    return { valid: false, error: '비밀번호는 최소 1개의 숫자를 포함해야 합니다.' };
  }

  return { valid: true };
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 비밀번호 해싱 (강도 검증 포함)
export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return bcrypt.hash(password, 10);
}

// JWT 토큰 생성
export async function createToken(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m') // 30분
    .sign(JWT_SECRET);

  return token;
}

// JWT 토큰 검증
export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string };
  } catch (error) {
    return null;
  }
}

// 쿠키에서 토큰 가져오기
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-token')?.value || null;
}

// 현재 사용자 검증
export async function getCurrentUser(): Promise<{ username: string } | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  return verifyToken(token);
}

// 쿠키 설정 (로그인 시)
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30, // 30분
    path: '/',
  });
}

// 쿠키 삭제 (로그아웃 시)
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  cookieStore.delete('csrf-token');
}

// CSRF 토큰 생성
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF 토큰 쿠키 설정
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('csrf-token', token, {
    httpOnly: false, // JavaScript에서 읽을 수 있어야 함
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30, // 30분
    path: '/',
  });
}

// CSRF 토큰 검증
export async function verifyCSRFToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) return false;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf-token')?.value;

  if (!cookieToken) return false;

  return headerToken === cookieToken;
}
