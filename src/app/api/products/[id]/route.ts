import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, hardDeleteProduct } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// ID 파싱 및 검증 헬퍼
function parseAndValidateId(id: string): number | null {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

// 제품 데이터 포맷팅 헬퍼
function formatProductResponse(product: Awaited<ReturnType<typeof getProductById>>) {
  if (!product) return null;

  return {
    id: product.id.toString(),
    name: product.name,
    category: product.category,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : null,
    thumbnail: product.thumbnail,
    detailImages: product.detail_images,
    description: product.description,
    tags: product.tags,
    isNew: product.is_new,
    isBestSeller: product.is_best_seller,
    isActive: product.is_active,
    stores: {
      naver: product.store_naver || undefined,
      coupang: product.store_coupang || undefined,
      etc: product.store_etc || undefined,
    },
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

// 특정 제품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseAndValidateId(id);

    if (numId === null) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await getProductById(numId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatProductResponse(product));
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 제품 수정
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
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 가격 검증
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price < 0) {
        return NextResponse.json(
          { error: 'Price must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // 할인가 검증
    if (body.originalPrice !== undefined && body.originalPrice !== null) {
      if (typeof body.originalPrice !== 'number' || body.originalPrice < 0) {
        return NextResponse.json(
          { error: 'Original price must be a non-negative number' },
          { status: 400 }
        );
      }

      // 현재 가격과 비교 (새 가격이 있으면 새 가격, 없으면 기존 가격과 비교)
      const priceToCompare = body.price ?? (await getProductById(numId))?.price ?? 0;
      if (Number(priceToCompare) > body.originalPrice) {
        return NextResponse.json(
          { error: 'Price cannot be greater than original price' },
          { status: 400 }
        );
      }
    }

    const product = await updateProduct(numId, {
      name: body.name?.trim(),
      category: body.category,
      price: body.price,
      original_price: body.originalPrice,
      thumbnail: body.thumbnail,
      detail_images: Array.isArray(body.detailImages) ? body.detailImages : undefined,
      description: body.description,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      is_new: body.isNew,
      is_best_seller: body.isBestSeller,
      is_active: body.isActive,
      store_naver: body.stores?.naver,
      store_coupang: body.stores?.coupang,
      store_etc: body.stores?.etc,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatProductResponse(product));
  } catch (error) {
    console.error('Update product error:', error);

    // 외래키 제약조건 위반 처리
    if (error instanceof Error && error.message.includes('fk_product_category')) {
      return NextResponse.json(
        { error: 'Invalid category. Please select a valid category.' },
        { status: 400 }
      );
    }

    // 할인가격 제약조건 위반 처리
    if (error instanceof Error && error.message.includes('chk_discount_price')) {
      return NextResponse.json(
        { error: 'Price cannot be greater than original price' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 제품 삭제 (기본: 소프트 삭제)
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
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // 하드 삭제 옵션 확인
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // 제품 존재 여부 확인
    const existing = await getProductById(numId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      await hardDeleteProduct(numId);
    } else {
      await deleteProduct(numId);
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Product permanently deleted' : 'Product deactivated',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
