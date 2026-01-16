import { NextRequest, NextResponse } from 'next/server';
import { getAllPromotions, createPromotion, getPromotions, PromotionFilter, PaginationParams } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 모든 프로모션 조회 (필터링 및 페이지네이션 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const type = searchParams.get('type') || undefined;
    const isNew = searchParams.get('isNew') === 'true' ? true :
                  searchParams.get('isNew') === 'false' ? false : undefined;
    const isActive = searchParams.get('isActive') !== 'false'; // 기본값 true
    const currentOnly = searchParams.get('currentOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 페이지네이션 없이 전체 조회
    if (searchParams.get('all') === 'true') {
      const promotions = await getAllPromotions();

      const formattedPromotions = promotions.map(p => ({
        id: p.id.toString(),
        type: p.type,
        badge: p.badge,
        title: p.title,
        description: p.description,
        image: p.image,
        link: p.link,
        isNew: p.is_new,
        isActive: p.is_active,
        discount: p.discount,
        startDate: p.start_date instanceof Date ? p.start_date.toISOString().split('T')[0] : p.start_date,
        endDate: p.end_date instanceof Date ? p.end_date.toISOString().split('T')[0] : p.end_date,
        sortOrder: p.sort_order,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      return NextResponse.json(formattedPromotions);
    }

    // 필터링 및 페이지네이션 적용 조회
    const filter: PromotionFilter = {
      type,
      isNew,
      isActive,
      currentOnly,
    };

    const pagination: PaginationParams = {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100), // 최대 100개
    };

    const result = await getPromotions(filter, pagination);

    const formattedPromotions = result.data.map(p => ({
      id: p.id.toString(),
      type: p.type,
      badge: p.badge,
      title: p.title,
      description: p.description,
      image: p.image,
      link: p.link,
      isNew: p.is_new,
      isActive: p.is_active,
      discount: p.discount,
      startDate: p.start_date instanceof Date ? p.start_date.toISOString().split('T')[0] : p.start_date,
      endDate: p.end_date instanceof Date ? p.end_date.toISOString().split('T')[0] : p.end_date,
      sortOrder: p.sort_order,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({
      data: formattedPromotions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 프로모션 생성
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
        { error: 'Promotion title is required' },
        { status: 400 }
      );
    }

    // 날짜 파싱 및 검증
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (body.startDate) {
      startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        );
      }
    }

    if (body.endDate) {
      endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        );
      }
    }

    // 날짜 순서 검증
    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    // 프로모션 타입 검증
    const validTypes = ['event', 'discount', 'new', 'limited'];
    const type = body.type || 'event';
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid promotion type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const promotion = await createPromotion({
      type,
      badge: body.badge || null,
      title: body.title.trim(),
      description: body.description || '',
      image: body.image || null,
      link: body.link || null,
      is_new: Boolean(body.isNew),
      discount: body.discount || null,
      start_date: startDate,
      end_date: endDate,
      sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
    });

    return NextResponse.json({
      id: promotion.id.toString(),
      type: promotion.type,
      badge: promotion.badge,
      title: promotion.title,
      description: promotion.description,
      image: promotion.image,
      link: promotion.link,
      isNew: promotion.is_new,
      isActive: promotion.is_active,
      discount: promotion.discount,
      startDate: promotion.start_date instanceof Date ? promotion.start_date.toISOString().split('T')[0] : promotion.start_date,
      endDate: promotion.end_date instanceof Date ? promotion.end_date.toISOString().split('T')[0] : promotion.end_date,
      sortOrder: promotion.sort_order,
      createdAt: promotion.created_at,
      updatedAt: promotion.updated_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Create promotion error:', error);

    // 날짜 제약조건 위반 처리
    if (error instanceof Error && error.message.includes('chk_promotion_dates')) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create promotion', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
