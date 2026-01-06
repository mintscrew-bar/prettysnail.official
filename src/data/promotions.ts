// ==========================================
// 프로모션/이벤트 카드 데이터
// 관리자 페이지에서 수정 가능하도록 분리
// 추후 CMS 또는 DB 연동 시 이 파일을 API로 대체
// ==========================================

export interface PromotionCard {
  id: string;
  type: 'event' | 'product' | 'notice';
  badge?: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  isNew?: boolean;
  discount?: string;
}

// 초기 프로모션 데이터 (빈 배열)
// 관리자 페이지에서 프로모션을 추가하세요.
export const promotions: PromotionCard[] = [];
