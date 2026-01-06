import { NextRequest, NextResponse } from 'next/server';
import { getStoredAuth, verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

// 로그인 시도 제한 (간단한 인메모리 저장소)
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

function getClientId(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(clientId: string): { allowed: boolean; remainingAttempts?: number; blockedMinutes?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(clientId);

  if (attempt) {
    // 차단 시간 확인
    if (attempt.blockedUntil > now) {
      const remainingMs = attempt.blockedUntil - now;
      return {
        allowed: false,
        blockedMinutes: Math.ceil(remainingMs / 60000),
      };
    }

    // 차단 시간이 지났으면 리셋
    if (attempt.blockedUntil > 0 && attempt.blockedUntil <= now) {
      loginAttempts.delete(clientId);
      return { allowed: true, remainingAttempts: 5 };
    }

    // 5회 초과 확인
    if (attempt.count >= 5) {
      const blockTime = now + 15 * 60 * 1000; // 15분
      attempt.blockedUntil = blockTime;
      return {
        allowed: false,
        blockedMinutes: 15,
      };
    }

    return { allowed: true, remainingAttempts: 5 - attempt.count };
  }

  return { allowed: true, remainingAttempts: 5 };
}

function recordFailedAttempt(clientId: string): void {
  const attempt = loginAttempts.get(clientId);
  if (attempt) {
    attempt.count++;
  } else {
    loginAttempts.set(clientId, { count: 1, blockedUntil: 0 });
  }
}

function clearAttempts(clientId: string): void {
  loginAttempts.delete(clientId);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Rate limit 확인
    const clientId = getClientId(request);
    const rateLimit = checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `로그인 시도 횟수를 초과했습니다. ${rateLimit.blockedMinutes}분 후에 다시 시도해주세요.`,
          blockedMinutes: rateLimit.blockedMinutes,
        },
        { status: 429 }
      );
    }

    // 저장된 인증 정보 가져오기
    const authData = getStoredAuth();

    // 사용자명 확인
    if (username !== authData.username) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        {
          error: `아이디 또는 비밀번호가 올바르지 않습니다. (${loginAttempts.get(clientId)?.count || 1}/5회)`,
          remainingAttempts: rateLimit.remainingAttempts ? rateLimit.remainingAttempts - 1 : 4,
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, authData.passwordHash);

    if (!isValid) {
      recordFailedAttempt(clientId);
      const currentCount = loginAttempts.get(clientId)?.count || 1;
      return NextResponse.json(
        {
          error: `아이디 또는 비밀번호가 올바르지 않습니다. (${currentCount}/5회)`,
          remainingAttempts: 5 - currentCount,
        },
        { status: 401 }
      );
    }

    // 로그인 성공
    clearAttempts(clientId);

    // JWT 토큰 생성 및 쿠키 설정
    const token = await createToken(username);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: '로그인되었습니다.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
