import { NextRequest, NextResponse } from 'next/server';
import { getPromotionById, updatePromotion, deletePromotion, hardDeletePromotion } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// ID 파싱 및 검증 헬퍼
function parseAndValidateId(id: string): number | null {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

// 프로모션 데이터 포맷팅 헬퍼
function formatPromotionResponse(promotion: Awaited<ReturnType<typeof getPromotionById>>) {
  if (!promotion) return null;

  return {
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
  };
}

// 특정 프로모션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseAndValidateId(id);

    if (numId === null) {
      return NextResponse.json(
        { error: 'Invalid promotion ID' },
        { status: 400 }
      );
    }

    const promotion = await getPromotionById(numId);

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatPromotionResponse(promotion));
  } catch (error) {
    console.error('Get promotion error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 프로모션 수정
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
        { error: 'Invalid promotion ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 날짜 파싱 및 검증
    let startDate: Date | null | undefined;
    let endDate: Date | null | undefined;

    if (body.startDate !== undefined) {
      if (body.startDate === null) {
        startDate = null;
      } else {
        startDate = new Date(body.startDate);
        if (isNaN(startDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid start date format' },
            { status: 400 }
          );
        }
      }
    }

    if (body.endDate !== undefined) {
      if (body.endDate === null) {
        endDate = null;
      } else {
        endDate = new Date(body.endDate);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid end date format' },
            { status: 400 }
          );
        }
      }
    }

    // 날짜 순서 검증 (둘 다 제공된 경우)
    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    // 프로모션 타입 검증 (제공된 경우)
    if (body.type !== undefined) {
      const validTypes = ['event', 'discount', 'new', 'limited'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: `Invalid promotion type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const promotion = await updatePromotion(numId, {
      type: body.type,
      badge: body.badge,
      title: body.title?.trim(),
      description: body.description,
      image: body.image,
      link: body.link,
      is_new: body.isNew,
      is_active: body.isActive,
      discount: body.discount,
      start_date: startDate,
      end_date: endDate,
      sort_order: body.sortOrder,
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatPromotionResponse(promotion));
  } catch (error) {
    console.error('Update promotion error:', error);

    // 날짜 제약조건 위반 처리
    if (error instanceof Error && error.message.includes('chk_promotion_dates')) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update promotion', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 프로모션 삭제 (기본: 소프트 삭제)
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
        { error: 'Invalid promotion ID' },
        { status: 400 }
      );
    }

    // 하드 삭제 옵션 확인
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // 프로모션 존재 여부 확인
    const existing = await getPromotionById(numId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      await hardDeletePromotion(numId);
    } else {
      await deletePromotion(numId);
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Promotion permanently deleted' : 'Promotion deactivated',
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete promotion', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
