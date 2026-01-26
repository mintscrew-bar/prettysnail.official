// ==========================================
// 제품 데이터
// 관리자 페이지에서 수정 가능하도록 분리
// 추후 CMS 또는 DB 연동 시 이 파일을 API로 대체
// ==========================================

export interface Product {
  id: string;
  name: string;
  category: '우렁이' | '채소' | '밀키트' | '기타';
  price: number;
  originalPrice?: number;
  thumbnail?: string; // 메인 썸네일 (하위 호환성)
  thumbnails?: string[]; // 여러 썸네일 이미지들 (갤러리용)
  detailImages?: string[]; // 상세 이미지들 (상세페이지용)
  description: string;
  tags?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  // 스토어 링크
  stores?: {
    naver?: string; // 네이버 스마트스토어 링크
    coupang?: string; // 쿠팡 링크
    etc?: string; // 기타 링크
  };
}

export const categories = [
  { id: 'all', name: '전체' },
  { id: '우렁이', name: '우렁이' },
  { id: '채소', name: '채소' },
  { id: '밀키트', name: '밀키트' },
  { id: '기타', name: '기타' },
];

// 초기 제품 데이터 (빈 배열)
// 관리자 페이지에서 제품을 추가하세요.
export const products: Product[] = [];
