import { sql } from '@vercel/postgres';

// ==========================================
// 데이터베이스 초기화
// ==========================================

export async function initializeDatabase() {
  try {
    // 프로모션 타입 ENUM 생성 (존재하지 않는 경우에만)
    await sql`
      DO $$ BEGIN
        CREATE TYPE promotion_type AS ENUM ('event', 'discount', 'new', 'limited');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;

    // 공지사항 카테고리 ENUM 생성
    await sql`
      DO $$ BEGIN
        CREATE TYPE notice_category AS ENUM ('공지', '이벤트', '업데이트', '기타');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;

    // 카테고리 테이블 (제품 카테고리 관리)
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 카테고리 인덱스
    await sql`
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order)
    `;

    // 기본 카테고리 삽입 (없는 경우에만)
    await sql`
      INSERT INTO categories (slug, name, sort_order)
      VALUES
        ('all', '전체', 0),
        ('우렁이', '우렁이', 1),
        ('채소', '채소', 2),
        ('밀키트', '밀키트', 3),
        ('기타', '기타', 4)
      ON CONFLICT (slug) DO NOTHING
    `;

    // 제품 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 0) NOT NULL CHECK (price >= 0),
        original_price DECIMAL(10, 0) CHECK (original_price IS NULL OR original_price >= 0),
        thumbnail TEXT,
        thumbnails TEXT[] DEFAULT '{}',
        detail_images TEXT[] DEFAULT '{}',
        description TEXT NOT NULL DEFAULT '',
        tags TEXT[] DEFAULT '{}',
        is_new BOOLEAN DEFAULT false,
        is_best_seller BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        store_naver TEXT,
        store_coupang TEXT,
        store_etc TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),

        -- 외래키 제약조건 (카테고리 참조)
        CONSTRAINT fk_product_category
          FOREIGN KEY (category)
          REFERENCES categories(slug)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,

        -- 할인가격이 원래 가격보다 작아야 함
        CONSTRAINT chk_discount_price
          CHECK (original_price IS NULL OR price <= original_price)
      )
    `;

    // thumbnails 컬럼 추가 (기존 테이블에 없는 경우)
    await sql`
      DO $$ BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnails TEXT[] DEFAULT '{}';
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$
    `;

    // 제품 인덱스
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller) WHERE is_best_seller = true
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true
    `;

    // 제품 이름 검색을 위한 GIN 인덱스 (텍스트 검색 최적화)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('simple', name))
    `;

    // 공지사항 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS notices (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        is_pinned BOOLEAN DEFAULT false,
        is_important BOOLEAN DEFAULT false,
        category VARCHAR(50) DEFAULT '공지',
        views INTEGER DEFAULT 0 CHECK (views >= 0),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 공지사항 인덱스
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notices_is_pinned ON notices(is_pinned DESC, date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notices_is_important ON notices(is_important) WHERE is_important = true
    `;

    // 프로모션 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL DEFAULT 'event',
        badge VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image TEXT,
        link TEXT,
        is_new BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        discount VARCHAR(50),
        start_date DATE,
        end_date DATE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),

        -- 시작일이 종료일보다 이전이어야 함
        CONSTRAINT chk_promotion_dates
          CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
      )
    `;

    // 프로모션 인덱스
    await sql`
      CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active) WHERE is_active = true
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_promotions_sort_order ON promotions(sort_order, created_at DESC)
    `;

    // updated_at 자동 업데이트 트리거 함수
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // 각 테이블에 트리거 적용
    await sql`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products
    `;
    await sql`
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_notices_updated_at ON notices
    `;
    await sql`
      CREATE TRIGGER update_notices_updated_at
        BEFORE UPDATE ON notices
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions
    `;
    await sql`
      CREATE TRIGGER update_promotions_updated_at
        BEFORE UPDATE ON promotions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// ==========================================
// 공통 타입 및 유틸리티
// ==========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==========================================
// 제품 CRUD
// ==========================================

export interface ProductDB {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  thumbnail: string | null;
  thumbnails: string[];
  detail_images: string[];
  description: string;
  tags: string[];
  is_new: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  store_naver: string | null;
  store_coupang: string | null;
  store_etc: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductFilter {
  category?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  search?: string;
}

export async function getProducts(
  filter?: ProductFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<ProductDB>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 50;
  const offset = (page - 1) * limit;

  // 기본 필터: 활성 상품만
  const isActive = filter?.isActive !== false;

  // 필터 조건 확인
  const hasCategory = filter?.category && filter.category !== 'all';
  const hasIsNew = filter?.isNew !== undefined;
  const hasIsBestSeller = filter?.isBestSeller !== undefined;
  const hasSearch = !!filter?.search;

  // 필터 조합에 따른 쿼리 실행
  let countResult;
  let result;

  if (hasCategory && hasIsNew && hasIsBestSeller && hasSearch) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_new = ${filter!.isNew}
        AND is_best_seller = ${filter!.isBestSeller}
        AND name ILIKE ${`%${filter!.search}%`}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_new = ${filter!.isNew}
        AND is_best_seller = ${filter!.isBestSeller}
        AND name ILIKE ${`%${filter!.search}%`}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory && hasSearch) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND name ILIKE ${`%${filter!.search}%`}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND name ILIKE ${`%${filter!.search}%`}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory && hasIsNew) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_new = ${filter!.isNew}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_new = ${filter!.isNew}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory && hasIsBestSeller) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_best_seller = ${filter!.isBestSeller}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
        AND is_best_seller = ${filter!.isBestSeller}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND category = ${filter!.category}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsNew) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsBestSeller) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND is_best_seller = ${filter!.isBestSeller}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND is_best_seller = ${filter!.isBestSeller}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasSearch) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
        AND name ILIKE ${`%${filter!.search}%`}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
        AND name ILIKE ${`%${filter!.search}%`}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    countResult = await sql`
      SELECT COUNT(*) as total FROM products
      WHERE is_active = ${isActive}
    `;
    result = await sql<ProductDB>`
      SELECT * FROM products
      WHERE is_active = ${isActive}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows.map(row => ({
      ...row,
      detail_images: row.detail_images || [],
      tags: row.tags || [],
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllProducts(): Promise<ProductDB[]> {
  const result = await sql<ProductDB>`
    SELECT * FROM products
    WHERE is_active = true
    ORDER BY created_at DESC
  `;
  return result.rows.map(row => ({
    ...row,
    detail_images: row.detail_images || [],
    tags: row.tags || [],
  }));
}

export async function getProductById(id: number): Promise<ProductDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const result = await sql<ProductDB>`
    SELECT * FROM products WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    detail_images: row.detail_images || [],
    tags: row.tags || [],
  };
}

export async function createProduct(
  product: Omit<ProductDB, 'id' | 'created_at' | 'updated_at' | 'is_active'>
): Promise<ProductDB> {
  // 배열을 PostgreSQL 형식으로 변환
  const detailImagesArray = product.detail_images && product.detail_images.length > 0
    ? `{${product.detail_images.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
    : '{}';
  const tagsArray = product.tags && product.tags.length > 0
    ? `{${product.tags.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
    : '{}';

  const thumbnailsArray = product.thumbnails && product.thumbnails.length > 0
    ? `{${product.thumbnails.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
    : '{}';

  const result = await sql<ProductDB>`
    INSERT INTO products (
      name, category, price, original_price, thumbnail, thumbnails, detail_images,
      description, tags, is_new, is_best_seller, store_naver, store_coupang, store_etc
    ) VALUES (
      ${product.name},
      ${product.category},
      ${product.price},
      ${product.original_price},
      ${product.thumbnail},
      ${thumbnailsArray}::text[],
      ${detailImagesArray}::text[],
      ${product.description || ''},
      ${tagsArray}::text[],
      ${product.is_new || false},
      ${product.is_best_seller || false},
      ${product.store_naver},
      ${product.store_coupang},
      ${product.store_etc}
    )
    RETURNING *
  `;

  const row = result.rows[0];
  return {
    ...row,
    thumbnails: row.thumbnails || [],
    detail_images: row.detail_images || [],
    tags: row.tags || [],
  };
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<ProductDB, 'id' | 'created_at' | 'updated_at'>>
): Promise<ProductDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  // 기존 제품 확인
  const existing = await getProductById(id);
  if (!existing) {
    return null;
  }

  // 배열을 PostgreSQL 형식으로 변환
  const thumbnailsArray = product.thumbnails !== undefined
    ? (product.thumbnails && product.thumbnails.length > 0
        ? `{${product.thumbnails.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
        : '{}')
    : null;
  const detailImagesArray = product.detail_images !== undefined
    ? (product.detail_images && product.detail_images.length > 0
        ? `{${product.detail_images.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
        : '{}')
    : null;
  const tagsArray = product.tags !== undefined
    ? (product.tags && product.tags.length > 0
        ? `{${product.tags.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`
        : '{}')
    : null;

  const result = await sql<ProductDB>`
    UPDATE products SET
      name = COALESCE(${product.name ?? null}, name),
      category = COALESCE(${product.category ?? null}, category),
      price = COALESCE(${product.price ?? null}, price),
      original_price = ${product.original_price ?? null},
      thumbnail = ${product.thumbnail ?? null},
      thumbnails = COALESCE(${thumbnailsArray}::text[], thumbnails),
      detail_images = COALESCE(${detailImagesArray}::text[], detail_images),
      description = COALESCE(${product.description ?? null}, description),
      tags = COALESCE(${tagsArray}::text[], tags),
      is_new = COALESCE(${product.is_new ?? null}, is_new),
      is_best_seller = COALESCE(${product.is_best_seller ?? null}, is_best_seller),
      is_active = COALESCE(${product.is_active ?? null}, is_active),
      store_naver = ${product.store_naver ?? null},
      store_coupang = ${product.store_coupang ?? null},
      store_etc = ${product.store_etc ?? null}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    thumbnails: row.thumbnails || [],
    detail_images: row.detail_images || [],
    tags: row.tags || [],
  };
}

export async function deleteProduct(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  // 소프트 삭제 (is_active = false)
  await sql`UPDATE products SET is_active = false WHERE id = ${id}`;
  return { success: true };
}

export async function hardDeleteProduct(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  await sql`DELETE FROM products WHERE id = ${id}`;
  return { success: true };
}

// ==========================================
// 공지사항 CRUD
// ==========================================

export interface NoticeDB {
  id: number;
  title: string;
  content: string;
  date: Date;
  is_pinned: boolean;
  is_important: boolean;
  category: string | null;
  views: number;
  created_at: Date;
  updated_at: Date;
}

export interface NoticeFilter {
  category?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  search?: string;
}

export async function getNotices(
  filter?: NoticeFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<NoticeDB>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const offset = (page - 1) * limit;

  // 필터 조건 확인
  const hasCategory = filter?.category && filter.category !== '전체';
  const hasIsPinned = filter?.isPinned !== undefined;
  const hasIsImportant = filter?.isImportant !== undefined;
  const hasSearch = !!filter?.search;

  let countResult;
  let result;

  if (hasCategory && hasSearch) {
    const searchPattern = `%${filter!.search}%`;
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE category = ${filter!.category}
        AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE category = ${filter!.category}
        AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory && hasIsPinned) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE category = ${filter!.category}
        AND is_pinned = ${filter!.isPinned}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE category = ${filter!.category}
        AND is_pinned = ${filter!.isPinned}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory && hasIsImportant) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE category = ${filter!.category}
        AND is_important = ${filter!.isImportant}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE category = ${filter!.category}
        AND is_important = ${filter!.isImportant}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCategory) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE category = ${filter!.category}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE category = ${filter!.category}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsPinned) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE is_pinned = ${filter!.isPinned}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE is_pinned = ${filter!.isPinned}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsImportant) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE is_important = ${filter!.isImportant}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE is_important = ${filter!.isImportant}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasSearch) {
    const searchPattern = `%${filter!.search}%`;
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
      WHERE title ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      WHERE title ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    countResult = await sql`
      SELECT COUNT(*) as total FROM notices
    `;
    result = await sql<NoticeDB>`
      SELECT * FROM notices
      ORDER BY is_pinned DESC, date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllNotices(): Promise<NoticeDB[]> {
  const result = await sql<NoticeDB>`
    SELECT * FROM notices
    ORDER BY is_pinned DESC, date DESC, created_at DESC
  `;
  return result.rows;
}

export async function getNoticeById(id: number): Promise<NoticeDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const result = await sql<NoticeDB>`
    SELECT * FROM notices WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function createNotice(
  notice: Omit<NoticeDB, 'id' | 'created_at' | 'updated_at' | 'views'>
): Promise<NoticeDB> {
  // Date 객체를 ISO 문자열로 변환
  const dateStr = notice.date instanceof Date
    ? notice.date.toISOString().split('T')[0]
    : notice.date;

  const result = await sql<NoticeDB>`
    INSERT INTO notices (title, content, date, is_pinned, is_important, category)
    VALUES (
      ${notice.title},
      ${notice.content},
      ${dateStr}::date,
      ${notice.is_pinned || false},
      ${notice.is_important || false},
      ${notice.category || '공지'}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateNotice(
  id: number,
  notice: Partial<Omit<NoticeDB, 'id' | 'created_at' | 'updated_at'>>
): Promise<NoticeDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  // 기존 공지사항 확인
  const existing = await getNoticeById(id);
  if (!existing) {
    return null;
  }

  // Date 객체를 ISO 문자열로 변환
  const dateStr = notice.date !== undefined
    ? (notice.date instanceof Date
        ? notice.date.toISOString().split('T')[0]
        : notice.date)
    : null;

  const result = await sql<NoticeDB>`
    UPDATE notices SET
      title = COALESCE(${notice.title ?? null}, title),
      content = COALESCE(${notice.content ?? null}, content),
      date = COALESCE(${dateStr}::date, date),
      is_pinned = COALESCE(${notice.is_pinned ?? null}, is_pinned),
      is_important = COALESCE(${notice.is_important ?? null}, is_important),
      category = COALESCE(${notice.category ?? null}, category),
      views = COALESCE(${notice.views ?? null}, views)
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function incrementNoticeViews(id: number): Promise<void> {
  if (isNaN(id) || id <= 0) {
    return;
  }

  await sql`
    UPDATE notices
    SET views = views + 1
    WHERE id = ${id}
  `;
}

export async function deleteNotice(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  await sql`DELETE FROM notices WHERE id = ${id}`;
  return { success: true };
}

// ==========================================
// 프로모션 CRUD
// ==========================================

export interface PromotionDB {
  id: number;
  type: string;
  badge: string | null;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  is_new: boolean;
  is_active: boolean;
  discount: string | null;
  start_date: Date | null;
  end_date: Date | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface PromotionFilter {
  type?: string;
  isNew?: boolean;
  isActive?: boolean;
  currentOnly?: boolean; // 현재 진행 중인 프로모션만
}

export async function getPromotions(
  filter?: PromotionFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<PromotionDB>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const offset = (page - 1) * limit;

  // 기본 필터: 활성 프로모션만
  const isActive = filter?.isActive !== false;
  const today = new Date().toISOString();

  // 필터 조건 확인
  const hasType = !!filter?.type;
  const hasIsNew = filter?.isNew !== undefined;
  const hasCurrentOnly = !!filter?.currentOnly;

  let countResult;
  let result;

  if (hasType && hasIsNew && hasCurrentOnly) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND is_new = ${filter!.isNew}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND is_new = ${filter!.isNew}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasType && hasCurrentOnly) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsNew && hasCurrentOnly) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasType && hasIsNew) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND is_new = ${filter!.isNew}
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
        AND is_new = ${filter!.isNew}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasType) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND type = ${filter!.type}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasIsNew) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND is_new = ${filter!.isNew}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (hasCurrentOnly) {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
        AND (start_date IS NULL OR start_date <= ${today})
        AND (end_date IS NULL OR end_date >= ${today})
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    countResult = await sql`
      SELECT COUNT(*) as total FROM promotions
      WHERE is_active = ${isActive}
    `;
    result = await sql<PromotionDB>`
      SELECT * FROM promotions
      WHERE is_active = ${isActive}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllPromotions(): Promise<PromotionDB[]> {
  const result = await sql<PromotionDB>`
    SELECT * FROM promotions
    WHERE is_active = true
    ORDER BY sort_order ASC, created_at DESC
  `;
  return result.rows;
}

export async function getPromotionById(id: number): Promise<PromotionDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const result = await sql<PromotionDB>`
    SELECT * FROM promotions WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function createPromotion(
  promotion: Omit<PromotionDB, 'id' | 'created_at' | 'updated_at' | 'is_active'>
): Promise<PromotionDB> {
  // Date 객체를 ISO 문자열로 변환
  const startDateStr = promotion.start_date instanceof Date
    ? promotion.start_date.toISOString().split('T')[0]
    : promotion.start_date;
  const endDateStr = promotion.end_date instanceof Date
    ? promotion.end_date.toISOString().split('T')[0]
    : promotion.end_date;

  const result = await sql<PromotionDB>`
    INSERT INTO promotions (
      type, badge, title, description, image, link, is_new, discount,
      start_date, end_date, sort_order
    ) VALUES (
      ${promotion.type || 'event'},
      ${promotion.badge},
      ${promotion.title},
      ${promotion.description || ''},
      ${promotion.image},
      ${promotion.link},
      ${promotion.is_new || false},
      ${promotion.discount},
      ${startDateStr}::date,
      ${endDateStr}::date,
      ${promotion.sort_order || 0}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function updatePromotion(
  id: number,
  promotion: Partial<Omit<PromotionDB, 'id' | 'created_at' | 'updated_at'>>
): Promise<PromotionDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  // 기존 프로모션 확인
  const existing = await getPromotionById(id);
  if (!existing) {
    return null;
  }

  // Date 객체를 ISO 문자열로 변환
  const startDateStr = promotion.start_date !== undefined
    ? (promotion.start_date instanceof Date
        ? promotion.start_date.toISOString().split('T')[0]
        : promotion.start_date)
    : null;
  const endDateStr = promotion.end_date !== undefined
    ? (promotion.end_date instanceof Date
        ? promotion.end_date.toISOString().split('T')[0]
        : promotion.end_date)
    : null;

  const result = await sql<PromotionDB>`
    UPDATE promotions SET
      type = COALESCE(${promotion.type ?? null}, type),
      badge = ${promotion.badge ?? null},
      title = COALESCE(${promotion.title ?? null}, title),
      description = COALESCE(${promotion.description ?? null}, description),
      image = ${promotion.image ?? null},
      link = ${promotion.link ?? null},
      is_new = COALESCE(${promotion.is_new ?? null}, is_new),
      is_active = COALESCE(${promotion.is_active ?? null}, is_active),
      discount = ${promotion.discount ?? null},
      start_date = COALESCE(${startDateStr}::date, start_date),
      end_date = COALESCE(${endDateStr}::date, end_date),
      sort_order = COALESCE(${promotion.sort_order ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function deletePromotion(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  // 소프트 삭제
  await sql`UPDATE promotions SET is_active = false WHERE id = ${id}`;
  return { success: true };
}

export async function hardDeletePromotion(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  await sql`DELETE FROM promotions WHERE id = ${id}`;
  return { success: true };
}

// ==========================================
// 카테고리
// ==========================================

export interface CategoryDB {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

export async function getCategories(): Promise<CategoryDB[]> {
  const result = await sql<CategoryDB>`
    SELECT * FROM categories
    WHERE is_active = true
    ORDER BY sort_order ASC
  `;
  return result.rows;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDB | null> {
  const result = await sql<CategoryDB>`
    SELECT * FROM categories WHERE slug = ${slug}
  `;
  return result.rows[0] || null;
}

export async function createCategory(
  category: Omit<CategoryDB, 'id' | 'created_at' | 'is_active'>
): Promise<CategoryDB> {
  const result = await sql<CategoryDB>`
    INSERT INTO categories (slug, name, sort_order)
    VALUES (${category.slug}, ${category.name}, ${category.sort_order || 0})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateCategory(
  id: number,
  category: Partial<Omit<CategoryDB, 'id' | 'created_at'>>
): Promise<CategoryDB | null> {
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const result = await sql<CategoryDB>`
    UPDATE categories SET
      slug = COALESCE(${category.slug ?? null}, slug),
      name = COALESCE(${category.name ?? null}, name),
      sort_order = COALESCE(${category.sort_order ?? null}, sort_order),
      is_active = COALESCE(${category.is_active ?? null}, is_active)
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function deleteCategory(id: number): Promise<{ success: boolean }> {
  if (isNaN(id) || id <= 0) {
    return { success: false };
  }

  // 소프트 삭제
  await sql`UPDATE categories SET is_active = false WHERE id = ${id}`;
  return { success: true };
}

// ==========================================
// 데이터베이스 유틸리티
// ==========================================

export async function getTableStats(): Promise<{
  products: number;
  notices: number;
  promotions: number;
  categories: number;
}> {
  const [products, notices, promotions, categories] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`,
    sql`SELECT COUNT(*) as count FROM notices`,
    sql`SELECT COUNT(*) as count FROM promotions WHERE is_active = true`,
    sql`SELECT COUNT(*) as count FROM categories WHERE is_active = true`,
  ]);

  return {
    products: parseInt(products.rows[0].count),
    notices: parseInt(notices.rows[0].count),
    promotions: parseInt(promotions.rows[0].count),
    categories: parseInt(categories.rows[0].count),
  };
}

// 데이터베이스 연결 테스트
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`SELECT 1`;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
