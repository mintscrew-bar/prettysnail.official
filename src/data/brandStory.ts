// 브랜드 스토리 섹션 데이터
export interface StorySection {
  id: string;
  type: "hero" | "split-layout" | "full-image" | "process" | "closing" | "cta";
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  images?: string[];
  details?: string[];
  icon?: string;
}

export interface BrandStory {
  opening: {
    title: string[];
    subtitle: string;
  };
  problem: {
    heading: string;
    description: string;
    image: string;
  };
  solution: {
    heading: string;
    description: string[];
    image: string;
  };
  farm: {
    heading: string;
    description: string;
    image: string;
  };
  quality: {
    heading: string;
    description: string[];
    processes: {
      id: string;
      title: string;
      description: string;
      image: string;
      icon: string;
    }[];
    haccpText: string;
  };
  values: {
    heading: string;
    description: string[];
    values: {
      id: string;
      icon: string;
      title: string;
      description: string;
    }[];
  };
  closing: {
    heading: string;
    paragraphs: string[];
  };
  cta: {
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

export const brandStory: BrandStory = {
  opening: {
    title: ["좋은 제품은", "왜 항상 비싸야만", "할까요?"],
    subtitle: "이 의문에서 이쁜우렁이는 시작했습니다.",
  },
  problem: {
    heading: "우리는 이 의문에서 시작했습니다",
    description:
      "신선하고 품질 좋은 우렁이를 합리적인 가격에 제공할 수 없을까? 시장을 살펴보니 불필요한 중간 유통 단계를 거치면서 가격은 계속 올라가고, 정작 소비자는 비싼 값을 치르고 있었습니다. 양식장에서 직접 수확된 우렁이는 5,000원인데, 여러 도매상과 소매상을 거치면서 거의 3배 이상의 가격으로 올라가고 있었습니다.",
    image: "/images/story/1.jpg",
  },
  solution: {
    heading: "단순한 해결책",
    description: [
      "해결책은 생각보다 단순했습니다. 양식장에서 바로 고객님께 배송하면 되는 것이었죠.",
      "복잡한 유통 구조를 과감히 단순화하고, 생산자와 소비자를 직접 연결했습니다. 그 결과 품질은 유지하면서도 가격을 거의 반으로 내릴 수 있게 되었습니다.",
      "이는 단순한 가격 인하가 아닙니다. 품질 좋은 제품을 더 많은 사람들이 경험하도록 만드는 것, 그것이 우리의 목표입니다.",
    ],
    image: "/images/story/2.jpg",
  },
  farm: {
    heading: "신선함의 시작",
    description:
      "깨끗한 수질 관리와 정성스러운 양식 기술로 건강하고 품질 좋은 우렁이를 키웁니다. 우리의 양식장은 최고의 환경에서 최고의 제품을 만들기 위한 약속입니다.",
    image: "/images/story/농장.jpg",
  },
  quality: {
    heading: "우리의 품질 관리",
    description: [
      "가격을 낮춘다고 해서 품질을 포기할 수는 없었습니다. 오히려 더 엄격하게 관리해야 한다고 생각했습니다.",
      "양식장의 수질 관리부터 시작해 신선한 우렁이만 선별하여 수확하고, 깨끗하게 세척합니다. 탈각과 이물질 제거 과정을 거친 후, 멸균 공정으로 위생을 보장합니다.",
      "정기적인 미생물 검사와 중금속 검사를 실시하고, 포장 전 육안 검수를 통해 불량품을 걸러냅니다. 최종 손질이 완료된 제품은 냉장 배송으로 신선도를 유지하며, 출고부터 배송까지 온도를 철저히 관리합니다.",
    ],
    processes: [
      {
        id: "1",
        title: "원물 선별",
        description: "신선하고 건강한 우렁이만 엄선합니다",
        image: "/images/story/1.jpg",
        icon: "🔍",
      },
      {
        id: "2",
        title: "탈각 및 정제",
        description: "이물질을 제거하고 깨끗하게 손질합니다",
        image: "/images/story/3.jpg",
        icon: "✨",
      },
      {
        id: "3",
        title: "멸균 공정",
        description: "HACCP 기준에 따라 안전하게 멸균합니다",
        image: "/images/story/4.jpg",
        icon: "🛡️",
      },
      {
        id: "4",
        title: "최종 손질",
        description: "육안 검수 후 냉장 배송 준비",
        image: "/images/story/5.jpg",
        icon: "✓",
      },
    ],
    haccpText: "HACCP 식품안전관리 인증",
  },
  values: {
    heading: "우리의 가치",
    description: [
      "이쁜우렁이는 단순히 제품을 파는 것이 아닙니다. 신뢰를 바탕으로 한 건강한 먹거리 문화를 만들어가고 있습니다. 우렁이는 칼슘과 철분이 풍부한 슈퍼푸드이자, 환경 오염을 정화하는 능력을 가진 자연의 선물입니다. 우리는 이를 제대로 대접하고, 고객님들에게 신뢰할 수 있는 형태로 전달하고 싶습니다.",
    ],
    values: [
      {
        id: "transparency",
        icon: "👁️",
        title: "투명성",
        description: "생산부터 배송까지 모든 과정을 공개합니다",
      },
      {
        id: "quality",
        icon: "⭐",
        title: "품질",
        description: "가격을 낮춰도 품질은 절대 포기하지 않습니다",
      },
      {
        id: "sustainability",
        icon: "🌱",
        title: "지속가능성",
        description: "환경과 건강을 고려한 양식 방식",
      },
      {
        id: "trust",
        icon: "🤝",
        title: "신뢰",
        description: "고객님의 신뢰가 우리의 자산입니다",
      },
    ],
  },
  closing: {
    heading: "투명한 신뢰",
    paragraphs: [
      "무엇보다 우리는 생산부터 배송까지 모든 과정을 투명하게 공개합니다. 고객님께서 무엇을 드시는지, 어떻게 만들어지는지 모두 알 권리가 있다고 믿기 때문입니다.",
      "우렁이의 영양가, 요리 방법, 보관법까지 모든 정보를 함께 전달합니다. 단순히 물건을 팔기보다는 신뢰할 수 있는 파트너가 되고 싶습니다.",
      "이것이 이쁜우렁이가 걸어온 길이고, 앞으로도 걸어갈 길입니다. 항상 고객님의 신뢰에 보답하겠습니다.",
    ],
  },
  cta: {
    heading: "이쁜우렁이와 함께하세요",
    description:
      "건강하고 맛있는 우렁이 제품을 합리적인 가격으로 경험해보세요. 신선함과 신뢰, 두 가지 모두를 담았습니다.",
    buttonText: "제품 둘러보기",
    buttonLink: "/products",
  },
};
