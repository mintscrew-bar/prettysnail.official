import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit 확인
    const clientId = getClientId(request);
    const rateLimit = await checkRateLimit(clientId, 'change-password');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `비밀번호 변경 요청이 너무 많습니다. ${rateLimit.blockedMinutes}분 후에 다시 시도해주세요.`,
        },
        { status: 429 }
      );
    }

    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Vercel serverless 환경에서는 환경변수 변경 불가
    return NextResponse.json(
      {
        error: '비밀번호 변경 기능은 현재 비활성화되어 있습니다. 비밀번호를 변경하려면 Vercel 환경변수 ADMIN_PASSWORD_HASH를 직접 업데이트하세요.',
        info: 'Generate hash: node -e "console.log(require(\'bcryptjs\').hashSync(\'your-password\', 10))"'
      },
      { status: 501 } // 501 Not Implemented
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
