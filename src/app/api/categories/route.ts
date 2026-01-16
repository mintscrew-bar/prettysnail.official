import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 모든 카테고리 조회
export async function GET() {
  try {
    const categories = await getCategories();

    const formattedCategories = categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      sortOrder: cat.sort_order,
      isActive: cat.is_active,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 카테고리 생성
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
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // slug 생성 (id로 사용)
    const slug = body.id || body.name;

    const category = await createCategory({
      slug,
      name: body.name.trim(),
      sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
    });

    return NextResponse.json({
      id: category.slug,
      name: category.name,
      sortOrder: category.sort_order,
      isActive: category.is_active,
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);

    // 중복 slug 처리
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
