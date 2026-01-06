export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  isPinned?: boolean; // 상단 고정 여부
  isImportant?: boolean; // 중요 공지 여부
  category?: string; // 카테고리 (공지, 이벤트, 안내 등)
  views?: number; // 조회수
}

// 샘플 공지사항 데이터
export const notices: Notice[] = [
  {
    id: 'notice-001',
    title: '이쁜우렁이 공식 홈페이지 오픈 안내',
    content: `안녕하세요. 이쁜우렁이입니다.

고객 여러분께 더 나은 서비스를 제공하고자 공식 홈페이지를 새롭게 오픈하게 되었습니다.

앞으로 이쁜우렁이의 다양한 제품 정보와 소식을 홈페이지에서 확인하실 수 있습니다.

많은 관심과 사랑 부탁드립니다.

감사합니다.`,
    date: '2024-12-16',
    isPinned: true,
    isImportant: true,
    category: '공지',
    views: 125,
  },
  {
    id: 'notice-002',
    title: 'HACCP 인증 시설 완료 안내',
    content: `안녕하세요. 이쁜우렁이입니다.

이쁜우렁이는 고객님들께 더욱 안전하고 신뢰할 수 있는 제품을 제공하기 위해 HACCP 인증 시설을 완료하였습니다.

HACCP(Hazard Analysis and Critical Control Points)은 식품의 원재료부터 제조, 가공, 보존, 유통, 조리 단계를 거쳐 최종 소비자가 섭취하기 전까지의 각 단계에서 발생할 우려가 있는 위해요소를 규명하고, 이를 중점적으로 관리하기 위한 기준을 설정하여 체계적이고 효율적으로 관리하는 과학적인 위생관리체계입니다.

앞으로도 이쁜우렁이는 고객님들의 건강과 안전을 최우선으로 생각하며 최고의 제품을 제공하기 위해 노력하겠습니다.

감사합니다.`,
    date: '2024-12-10',
    isPinned: false,
    isImportant: true,
    category: '공지',
    views: 89,
  },
  {
    id: 'notice-003',
    title: '연말 특별 할인 이벤트 안내',
    content: `안녕하세요. 이쁜우렁이입니다.

연말을 맞이하여 고객님들께 감사의 마음을 전하고자 특별 할인 이벤트를 진행합니다.

[이벤트 기간]
2024년 12월 20일 ~ 2024년 12월 31일

[할인 내용]
- 전 제품 10% 할인
- 3만원 이상 구매 시 무료 배송

네이버 스마트스토어와 쿠팡에서 만나보실 수 있습니다.

많은 관심과 참여 부탁드립니다.

감사합니다.`,
    date: '2024-12-05',
    isPinned: false,
    isImportant: false,
    category: '이벤트',
    views: 156,
  },
  {
    id: 'notice-004',
    title: '배송 지연 안내 (명절 연휴)',
    content: `안녕하세요. 이쁜우렁이입니다.

설 명절 연휴로 인해 배송이 지연될 수 있음을 안내드립니다.

[배송 지연 기간]
2024년 2월 8일 ~ 2024년 2월 12일

연휴 기간 중 주문하신 상품은 연휴 종료 후 순차적으로 발송될 예정입니다.

고객님들의 양해 부탁드리며, 빠른 시일 내에 배송될 수 있도록 최선을 다하겠습니다.

감사합니다.`,
    date: '2024-02-01',
    isPinned: false,
    isImportant: false,
    category: '안내',
    views: 45,
  },
];
