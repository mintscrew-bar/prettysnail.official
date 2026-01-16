import { NextRequest, NextResponse } from 'next/server';
import { getStoredAuth, verifyPassword, createToken, setAuthCookie, generateCSRFToken, setCSRFCookie } from '@/lib/auth';
import { checkRateLimit, recordFailedAttempt, clearAttempts, getClientId } from '@/lib/rate-limit';

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
    const rateLimit = await checkRateLimit(clientId);

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
      const currentCount = await recordFailedAttempt(clientId);
      return NextResponse.json(
        {
          error: `아이디 또는 비밀번호가 올바르지 않습니다. (${currentCount}/5회)`,
          remainingAttempts: 5 - currentCount,
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, authData.passwordHash);

    if (!isValid) {
      const currentCount = await recordFailedAttempt(clientId);
      return NextResponse.json(
        {
          error: `아이디 또는 비밀번호가 올바르지 않습니다. (${currentCount}/5회)`,
          remainingAttempts: 5 - currentCount,
        },
        { status: 401 }
      );
    }

    // 로그인 성공
    await clearAttempts(clientId);

    // JWT 토큰 생성 및 쿠키 설정
    const token = await createToken(username);
    await setAuthCookie(token);

    // CSRF 토큰 생성 및 쿠키 설정
    const csrfToken = generateCSRFToken();
    await setCSRFCookie(csrfToken);

    return NextResponse.json({
      success: true,
      message: '로그인되었습니다.',
      csrfToken, // 클라이언트에서 헤더에 포함하도록 전달
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
