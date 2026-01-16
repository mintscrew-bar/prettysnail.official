import { NextRequest, NextResponse } from 'next/server';
import { getAllNotices, createNotice, getNotices, NoticeFilter, PaginationParams } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 모든 공지사항 조회 (필터링 및 페이지네이션 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const category = searchParams.get('category') || undefined;
    const isPinned = searchParams.get('isPinned') === 'true' ? true :
                     searchParams.get('isPinned') === 'false' ? false : undefined;
    const isImportant = searchParams.get('isImportant') === 'true' ? true :
                        searchParams.get('isImportant') === 'false' ? false : undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 페이지네이션 없이 전체 조회
    if (searchParams.get('all') === 'true') {
      const notices = await getAllNotices();

      const formattedNotices = notices.map(n => ({
        id: n.id.toString(),
        title: n.title,
        content: n.content,
        date: n.date instanceof Date ? n.date.toISOString().split('T')[0] : n.date,
        isPinned: n.is_pinned,
        isImportant: n.is_important,
        category: n.category,
        views: n.views,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }));

      return NextResponse.json(formattedNotices);
    }

    // 필터링 및 페이지네이션 적용 조회
    const filter: NoticeFilter = {
      category,
      isPinned,
      isImportant,
      search,
    };

    const pagination: PaginationParams = {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100), // 최대 100개
    };

    const result = await getNotices(filter, pagination);

    const formattedNotices = result.data.map(n => ({
      id: n.id.toString(),
      title: n.title,
      content: n.content,
      date: n.date instanceof Date ? n.date.toISOString().split('T')[0] : n.date,
      isPinned: n.is_pinned,
      isImportant: n.is_important,
      category: n.category,
      views: n.views,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));

    return NextResponse.json({
      data: formattedNotices,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get notices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 공지사항 생성
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

    // 필수 필드 검증
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Notice title is required' },
        { status: 400 }
      );
    }

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Notice content is required' },
        { status: 400 }
      );
    }

    // 날짜 파싱 및 검증
    let date: Date;
    if (body.date) {
      date = new Date(body.date);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
    } else {
      date = new Date();
    }

    const notice = await createNotice({
      title: body.title.trim(),
      content: body.content.trim(),
      date,
      is_pinned: Boolean(body.isPinned),
      is_important: Boolean(body.isImportant),
      category: body.category || '공지',
    });

    return NextResponse.json({
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
    }, { status: 201 });
  } catch (error) {
    console.error('Create notice error:', error);
    return NextResponse.json(
      { error: 'Failed to create notice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
