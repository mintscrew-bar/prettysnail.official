export type IconType = 'harvest' | 'wash' | 'shell' | 'sterilize' | 'prepare' | 'package';

export interface StoryStep {
  id: number;
  label: string;
  title: string;
  description: string;
  image: string;
  iconType: IconType;
}

export const storySteps: StoryStep[] = [
  {
    id: 1,
    label: '수확',
    title: '신선한 우렁이 원물',
    description:
      '맑은 물에서 정성껏 양식한 국내산 우렁이를 수확합니다. 무항생제 사료만 사용해 건강하게 키운 우렁이예요.',
    image: '원물.jpg',
    iconType: 'harvest',
  },
  {
    id: 2,
    label: '세척',
    title: '탈각 전 꼼꼼한 세척',
    description:
      'HACCP 인증 시설에서 위생적으로 세척합니다. 껍질을 완벽하게 제거하기 위한 첫 단계예요.',
    image: '탈각 전.jpg',
    iconType: 'wash',
  },
  {
    id: 3,
    label: '탈각',
    title: '껍질 제거 및 이물질 제거',
    description:
      '껍질 탈각 후 숙련된 작업자가 추가적인 이물질이나 불순물을 거르고 좋은 우렁이를 선별해요.',
    image: '탈각 및 이물질 제거 후.jpg',
    iconType: 'shell',
  },
  {
    id: 4,
    label: '멸균',
    title: '위생적인 멸균 공정',
    description:
      '엄격한 위생 기준에 따라 멸균 처리합니다. 안심하고 드실 수 있도록 철저하게 관리해요.',
    image: '멸균 공정 후.jpg',
    iconType: 'sterilize',
  },
  {
    id: 5,
    label: '손질',
    title: '최종 손질 완료',
    description:
      '완벽하게 손질 된 우렁이입니다. 바로 요리에 사용할 수 있어요.',
    image: '손질 완료.jpg',
    iconType: 'prepare',
  },
  {
    id: 6,
    label: '포장',
    title: '신선함을 그대로 담아',
    description:
      '위생적으로 포장하여 신선함을 유지한 채 고객님께 전달됩니다. 국내산 우렁이의 맛을 그대로 느껴보세요.',
    image: '1.jpg',
    iconType: 'package',
  },
];
