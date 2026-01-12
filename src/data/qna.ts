export interface QnA {
  id: string;
  category: string; // 카테고리 (주문/배송, 제품, 반품/교환 등)
  question: string; // 질문 제목
  content: string; // 질문 내용
  author: string; // 작성자
  date: string; // 작성일 (ISO 8601 format)
  status: 'waiting' | 'answered'; // 답변 대기 / 답변 완료
  answer?: {
    content: string;
    date: string;
    author: string;
  };
  isSecret?: boolean; // 비밀글 여부
  views?: number; // 조회수
}

// FAQ 데이터 타입
export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// FAQ 샘플 데이터
export const faqs: FAQ[] = [
  {
    id: 'faq-001',
    category: '주문/배송',
    question: '배송은 얼마나 걸리나요?',
    answer: '주문 후 2-3일 이내에 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.',
  },
  {
    id: 'faq-002',
    category: '주문/배송',
    question: '무료 배송 기준이 어떻게 되나요?',
    answer: '쿠팡, 네이버 스마트 스토어 별로 무료 배송 기준이 다릅니다. 각 스토어 페이지에서 확인 부탁드립니다.',
  },
  {
    id: 'faq-003',
    category: '제품',
    question: '우렁이는 어떻게 보관하나요?',
    answer: '냉동 보관하시면 됩니다. 개봉 후에는 밀폐 용기에 담아 냉장 보관하시고, 2-3일 내에 드시는 것을 권장드립니다.',
  },
  {
    id: 'faq-004',
    category: '제품',
    question: 'HACCP 인증이 무엇인가요?',
    answer: 'HACCP(해썹)은 식품의 원재료부터 제조, 가공, 보존, 유통, 조리 단계를 거쳐 최종 소비자가 섭취하기 전까지 각 단계에서 발생할 우려가 있는 위해요소를 규명하고 관리하는 과학적인 위생관리체계입니다. 이쁜우렁이는 HACCP 인증 시설에서 위생적으로 생산됩니다.',
  },
  {
    id: 'faq-005',
    category: '반품/교환',
    question: '제품 교환이나 환불은 어떻게 하나요?',
    answer: '제품 수령 후 7일 이내에 고객센터로 연락주시면 교환 또는 환불 처리해드립니다. 단, 제품 특성상 단순 변심, 혹은 제품 개봉 후에는 교환 및 환불이 어려울 수 있습니다.',
  },
  {
    id: 'faq-006',
    category: '반품/교환',
    question: '불량 제품을 받았어요. 어떻게 해야 하나요?',
    answer: '제품 불량 시 즉시 네이버톡톡 혹은 메일로 연락주시면 새 제품으로 교환해드립니다. 불량 제품은 반송비 없이 교환 가능합니다.',
  },
];

// Q&A 샘플 데이터
export const qnas: QnA[] = [
  {
    id: 'qna-001',
    category: '제품',
    question: '우렁이 요리법이 궁금해요',
    content: '처음 우렁이를 구매했는데 어떻게 조리하면 좋을까요? 추천하는 요리법이 있나요?',
    author: '김**',
    date: '2024-12-20',
    status: 'answered',
    answer: {
      content: '안녕하세요. 이쁜우렁이입니다.\n\n우렁이는 다양한 방법으로 조리할 수 있습니다!\n\n1. 우렁이 강된장: 된장, 고추장과 함께 볶아주시면 맛있는 강된장이 됩니다.\n2. 우렁이 무침: 양념장에 무쳐서 반찬으로 드시면 좋습니다.\n3. 우렁이 볶음: 야채와 함께 볶아주시면 간단한 반찬이 됩니다.\n\n자세한 레시피는 네이버 블로그에서 확인하실 수 있습니다.\n감사합니다!',
      date: '2024-12-21',
      author: '관리자',
    },
    views: 45,
  },
  {
    id: 'qna-002',
    category: '주문/배송',
    question: '대량 주문 가능한가요?',
    content: '식당을 운영하고 있는데 대량 주문이 가능한지 궁금합니다. 도매가로 구매할 수 있나요?',
    author: '이**',
    date: '2024-12-18',
    status: 'answered',
    answer: {
      content: '안녕하세요. 이쁜우렁이입니다.\n\n대량 주문 및 도매 문의는 별도로 상담이 필요합니다.\n고객센터(010-0000-0000)로 연락주시면 자세한 안내 도와드리겠습니다.\n\n감사합니다!',
      date: '2024-12-18',
      author: '관리자',
    },
    views: 32,
  },
  {
    id: 'qna-003',
    category: '주문/배송',
    question: '제주도 배송 가능한가요?',
    content: '제주도인데 배송이 가능한지 궁금합니다. 배송비는 얼마나 나올까요?',
    author: '박**',
    date: '2024-12-15',
    status: 'waiting',
    views: 28,
  },
  {
    id: 'qna-004',
    category: '제품',
    question: '알레르기 정보가 궁금합니다',
    content: '조개류 알레르기가 있는데 우렁이도 조개류에 포함되나요?',
    author: '최**',
    date: '2024-12-12',
    status: 'answered',
    answer: {
      content: '안녕하세요. 이쁜우렁이입니다.\n\n우렁이는 연체동물에 속하며, 조개류 알레르기가 있으신 분들은 주의가 필요합니다.\n섭취 전 전문의와 상담하시는 것을 권장드립니다.\n\n감사합니다!',
      date: '2024-12-13',
      author: '관리자',
    },
    views: 52,
  },
];
