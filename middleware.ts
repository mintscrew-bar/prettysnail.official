import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지와 API 라우트는 체크하지 않음
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 관리자 페이지 보호
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // 토큰 검증
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
