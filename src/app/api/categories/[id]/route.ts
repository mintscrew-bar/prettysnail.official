import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug, updateCategory, deleteCategory } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 특정 카테고리 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await getCategoryBySlug(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: category.slug,
      name: category.name,
      sortOrder: category.sort_order,
      isActive: category.is_active,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 카테고리 수정
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

    // 'all' 카테고리는 수정 불가
    if (id === 'all') {
      return NextResponse.json(
        { error: 'Cannot modify the "all" category' },
        { status: 403 }
      );
    }

    // 기존 카테고리 조회
    const existing = await getCategoryBySlug(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const category = await updateCategory(existing.id, {
      name: body.name?.trim(),
      sort_order: body.sortOrder,
      is_active: body.isActive,
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: category.slug,
      name: category.name,
      sortOrder: category.sort_order,
      isActive: category.is_active,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 카테고리 삭제 (소프트 삭제)
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

    // 'all' 카테고리는 삭제 불가
    if (id === 'all') {
      return NextResponse.json(
        { error: 'Cannot delete the "all" category' },
        { status: 403 }
      );
    }

    // 기존 카테고리 조회
    const existing = await getCategoryBySlug(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    await deleteCategory(existing.id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
