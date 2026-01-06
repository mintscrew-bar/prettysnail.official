import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getStoredAuth, verifyPassword, hashPassword, saveAuth, clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 유효성 검사
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인
    const authData = getStoredAuth();
    const isValid = await verifyPassword(currentPassword, authData.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 새 비밀번호 해싱
    const newPasswordHash = await hashPassword(newPassword);

    // 새 비밀번호 저장
    saveAuth(authData.username, newPasswordHash);

    // 보안을 위해 로그아웃 (재로그인 필요)
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
