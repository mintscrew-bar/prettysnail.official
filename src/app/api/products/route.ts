import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, getProducts, ProductFilter, PaginationParams } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 모든 제품 조회 (필터링 및 페이지네이션 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const category = searchParams.get('category') || undefined;
    const isNew = searchParams.get('isNew') === 'true' ? true :
                  searchParams.get('isNew') === 'false' ? false : undefined;
    const isBestSeller = searchParams.get('isBestSeller') === 'true' ? true :
                         searchParams.get('isBestSeller') === 'false' ? false : undefined;
    const isActive = searchParams.get('isActive') !== 'false'; // 기본값 true
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 페이지네이션 없이 전체 조회
    if (searchParams.get('all') === 'true') {
      const products = await getAllProducts();

      const formattedProducts = products.map(p => ({
        id: p.id.toString(),
        name: p.name,
        category: p.category,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : null,
        thumbnail: p.thumbnail,
        detailImages: p.detail_images,
        description: p.description,
        tags: p.tags,
        isNew: p.is_new,
        isBestSeller: p.is_best_seller,
        isActive: p.is_active,
        stores: {
          naver: p.store_naver || undefined,
          coupang: p.store_coupang || undefined,
          etc: p.store_etc || undefined,
        },
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      return NextResponse.json(formattedProducts);
    }

    // 필터링 및 페이지네이션 적용 조회
    const filter: ProductFilter = {
      category,
      isNew,
      isBestSeller,
      isActive,
      search,
    };

    const pagination: PaginationParams = {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 50 : Math.min(limit, 100), // 최대 100개
    };

    const result = await getProducts(filter, pagination);

    const formattedProducts = result.data.map(p => ({
      id: p.id.toString(),
      name: p.name,
      category: p.category,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      thumbnail: p.thumbnail,
      detailImages: p.detail_images,
      description: p.description,
      tags: p.tags,
      isNew: p.is_new,
      isBestSeller: p.is_best_seller,
      isActive: p.is_active,
      stores: {
        naver: p.store_naver || undefined,
        coupang: p.store_coupang || undefined,
        etc: p.store_etc || undefined,
      },
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({
      data: formattedProducts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 제품 생성
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
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Product category is required' },
        { status: 400 }
      );
    }

    if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json(
        { error: 'Valid product price is required' },
        { status: 400 }
      );
    }

    // 할인가 검증
    if (body.originalPrice !== undefined && body.originalPrice !== null) {
      if (typeof body.originalPrice !== 'number' || body.originalPrice < 0) {
        return NextResponse.json(
          { error: 'Original price must be a non-negative number' },
          { status: 400 }
        );
      }
      if (body.price > body.originalPrice) {
        return NextResponse.json(
          { error: 'Price cannot be greater than original price' },
          { status: 400 }
        );
      }
    }

    const product = await createProduct({
      name: body.name.trim(),
      category: body.category,
      price: body.price,
      original_price: body.originalPrice || null,
      thumbnail: body.thumbnail || null,
      detail_images: Array.isArray(body.detailImages) ? body.detailImages : [],
      description: body.description || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      is_new: Boolean(body.isNew),
      is_best_seller: Boolean(body.isBestSeller),
      store_naver: body.stores?.naver || null,
      store_coupang: body.stores?.coupang || null,
      store_etc: body.stores?.etc || null,
    });

    return NextResponse.json({
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
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);

    // 외래키 제약조건 위반 처리
    if (error instanceof Error && error.message.includes('fk_product_category')) {
      return NextResponse.json(
        { error: 'Invalid category. Please select a valid category.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
