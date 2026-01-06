import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
const AUTH_FILE_PATH = path.join(process.cwd(), 'data', 'auth.json');

interface AuthData {
  username: string;
  passwordHash: string;
}

// 저장된 인증 정보 가져오기
export function getStoredAuth(): AuthData {
  // 먼저 파일에서 확인 (비밀번호 변경된 경우)
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const data = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const authData = JSON.parse(data);
      return authData;
    }
  } catch (error) {
    console.error('Error reading auth file:', error);
  }

  // 파일이 없으면 환경 변수에서 가져오기
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
  };
}

// 인증 정보 저장 (비밀번호 변경 시)
export function saveAuth(username: string, passwordHash: string): void {
  try {
    const dirPath = path.dirname(AUTH_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const authData: AuthData = { username, passwordHash };
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData, null, 2));
  } catch (error) {
    console.error('Error saving auth file:', error);
    throw new Error('Failed to save credentials');
  }
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
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
}
