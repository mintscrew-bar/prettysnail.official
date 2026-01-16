import { NextRequest, NextResponse } from 'next/server';
import { getNoticeById, updateNotice, deleteNotice, incrementNoticeViews } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// ID 파싱 및 검증 헬퍼
function parseAndValidateId(id: string): number | null {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

// 공지사항 데이터 포맷팅 헬퍼
function formatNoticeResponse(notice: Awaited<ReturnType<typeof getNoticeById>>) {
  if (!notice) return null;

  return {
    id: notice.id.toString(),
    title: notice.title,
    content: notice.content,
    date: notice.date instanceof Date ? notice.date.toISOString().split('T')[0] : notice.date,
    isPinned: notice.is_pinned,
    isImportant: notice.is_important,
    category: notice.category,
    views: notice.views,
    createdAt: notice.created_at,
    updatedAt: notice.updated_at,
  };
}

// 특정 공지사항 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseAndValidateId(id);

    if (numId === null) {
      return NextResponse.json(
        { error: 'Invalid notice ID' },
        { status: 400 }
      );
    }

    const notice = await getNoticeById(numId);

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    // 조회수 증가 옵션 확인 (기본값: true)
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get('incrementViews') !== 'false';

    if (incrementViews) {
      await incrementNoticeViews(numId);
      // 증가된 조회수 반영
      notice.views += 1;
    }

    return NextResponse.json(formatNoticeResponse(notice));
  } catch (error) {
    console.error('Get notice error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 공지사항 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const numId = parseAndValidateId(id);

    if (numId === null) {
      return NextResponse.json(
        { error: 'Invalid notice ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 날짜 파싱 (제공된 경우)
    let date: Date | undefined;
    if (body.date) {
      date = new Date(body.date);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
    }

    // views 검증 (제공된 경우)
    if (body.views !== undefined) {
      if (typeof body.views !== 'number' || body.views < 0) {
        return NextResponse.json(
          { error: 'Views must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    const notice = await updateNotice(numId, {
      title: body.title?.trim(),
      content: body.content?.trim(),
      date,
      is_pinned: body.isPinned,
      is_important: body.isImportant,
      category: body.category,
      views: body.views,
    });

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatNoticeResponse(notice));
  } catch (error) {
    console.error('Update notice error:', error);
    return NextResponse.json(
      { error: 'Failed to update notice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 공지사항 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const numId = parseAndValidateId(id);

    if (numId === null) {
      return NextResponse.json(
        { error: 'Invalid notice ID' },
        { status: 400 }
      );
    }

    // 공지사항 존재 여부 확인
    const existing = await getNoticeById(numId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    await deleteNotice(numId);

    return NextResponse.json({
      success: true,
      message: 'Notice deleted',
    });
  } catch (error) {
    console.error('Delete notice error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
