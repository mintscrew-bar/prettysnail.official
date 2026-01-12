# 홈페이지 page.tsx 리팩토링 계획

## 📊 현재 상태 분석

**파일:** `src/app/page.tsx` (912줄)

### 컴포넌트 구성
1. **Preloader** (줄 18-70) - 52줄
2. **MainBanner** (줄 75-248) - 173줄
3. **HookSection** (줄 253-385) - 132줄
4. **StorytellingSection** (줄 390-580) - 190줄 (데이터 포함)
5. **ProductShowcase** (줄 585-805) - 220줄
6. **OutroSection** (줄 810-875) - 65줄
7. **Homepage** 메인 (줄 880-912) - 32줄

### 문제점
- ❌ 단일 파일에 모든 컴포넌트 정의 (유지보수 어려움)
- ❌ storySteps 데이터가 컴포넌트 파일 내부에 하드코딩
- ❌ SCSS 모듈이 하나로 통합 (스타일 충돌 가능성)
- ❌ Props 타입이 인라인으로 정의됨
- ❌ localStorage 로직 중복 (HookSection, ProductShowcase)

### 장점 (유지해야 할 부분)
- ✅ GSAP 컨텍스트가 각 컴포넌트에서 독립적으로 관리됨
- ✅ ScrollTrigger cleanup이 제대로 구현됨
- ✅ SSR 안전성 (`typeof window !== 'undefined'` 체크)

---

## 🎯 리팩토링 목표

### 1단계: 컴포넌트 분리
각 섹션을 독립적인 파일로 분리하고, 명확한 Props 인터페이스 정의

### 2단계: 데이터 분리
하드코딩된 데이터를 `src/data/` 폴더로 이동

### 3단계: 스타일 분리
각 컴포넌트별 SCSS 모듈 생성

### 4단계: 로직 최적화
중복된 localStorage 로직을 커스텀 훅으로 추출

---

## 📁 새로운 파일 구조

```
src/
├── components/
│   ├── Preloader.tsx              # 프리로더 컴포넌트
│   ├── Preloader.module.scss
│   └── home/
│       ├── MainBanner.tsx
│       ├── MainBanner.module.scss
│       ├── HookSection.tsx
│       ├── HookSection.module.scss
│       ├── StorytellingSection.tsx
│       ├── StorytellingSection.module.scss
│       ├── ProductShowcase.tsx
│       ├── ProductShowcase.module.scss
│       ├── OutroSection.tsx
│       └── OutroSection.module.scss
├── data/
│   ├── storySteps.ts              # 스토리텔링 단계 데이터
│   ├── promotions.ts              # (기존)
│   └── products.ts                # (기존)
├── hooks/
│   ├── useLocalStorage.ts         # (기존)
│   └── useLocalStorageData.ts     # localStorage 데이터 로드 훅 (신규)
└── app/
    ├── page.tsx                   # 간결해진 메인 페이지 (100줄 미만)
    └── page.module.scss           # 레이아웃용 스타일만 남김
```

---

## 🔧 단계별 작업 계획

### Task 1: 데이터 분리
**파일:** `src/data/storySteps.ts`

```typescript
export interface StoryStep {
  id: number;
  label: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

export const storySteps: StoryStep[] = [
  // ... 기존 storySteps 데이터 이동
];
```

**예상 소요 시간:** 10분

---

### Task 2: Preloader 컴포넌트 분리
**파일:** `src/components/Preloader.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.scss';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  // ... 기존 로직
}
```

**SCSS 분리:** `src/components/Preloader.module.scss`
- `.preloader`, `.preloaderLogo` 스타일 이동

**예상 소요 시간:** 15분

---

### Task 3: MainBanner 컴포넌트 분리
**파일:** `src/components/home/MainBanner.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './MainBanner.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function MainBanner() {
  // ... 기존 로직
}
```

**SCSS 분리:** `src/components/home/MainBanner.module.scss`
- `.mainSequence`, `.mainSequenceBg`, `.bgVideo` 등 관련 스타일 이동

**예상 소요 시간:** 20분

---

### Task 4: HookSection 컴포넌트 분리
**파일:** `src/components/home/HookSection.tsx`

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './HookSection.module.scss';
import { promotions, PromotionCard } from '@/data/promotions';

gsap.registerPlugin(ScrollTrigger);

export default function HookSection() {
  // ... 기존 로직 (localStorage 로드 포함)
}
```

**SCSS 분리:** `src/components/home/HookSection.module.scss`
- `.hookSection`, `.promoCards`, `.promoCard` 등 관련 스타일 이동

**예상 소요 시간:** 20분

---

### Task 5: StorytellingSection 컴포넌트 분리
**파일:** `src/components/home/StorytellingSection.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './StorytellingSection.module.scss';
import { storySteps } from '@/data/storySteps';

gsap.registerPlugin(ScrollTrigger);

export default function StorytellingSection() {
  // ... 기존 로직
}
```

**SCSS 분리:** `src/components/home/StorytellingSection.module.scss`
- `.storySection`, `.storyItem`, `.storyImage` 등 관련 스타일 이동

**예상 소요 시간:** 20분

---

### Task 6: ProductShowcase 컴포넌트 분리
**파일:** `src/components/home/ProductShowcase.tsx`

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ProductShowcase.module.scss';
import { products, categories as initialCategories } from '@/data/products';

gsap.registerPlugin(ScrollTrigger);

export default function ProductShowcase() {
  // ... 기존 로직 (localStorage 로드 포함)
}
```

**SCSS 분리:** `src/components/home/ProductShowcase.module.scss`
- `.productSection`, `.productCard`, `.productGrid` 등 관련 스타일 이동

**예상 소요 시간:** 25분

---

### Task 7: OutroSection 컴포넌트 분리
**파일:** `src/components/home/OutroSection.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './OutroSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function OutroSection() {
  // ... 기존 로직
}
```

**SCSS 분리:** `src/components/home/OutroSection.module.scss`
- `.outroSection`, `.storeCards`, `.storeCard` 등 관련 스타일 이동

**예상 소요 시간:** 15분

---

### Task 8: 메인 페이지 통합
**파일:** `src/app/page.tsx` (리팩토링 후)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import MainBanner from '@/components/home/MainBanner';
import HookSection from '@/components/home/HookSection';
import StorytellingSection from '@/components/home/StorytellingSection';
import ProductShowcase from '@/components/home/ProductShowcase';
import OutroSection from '@/components/home/OutroSection';

export default function Homepage() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    document.body.classList.remove('loading');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('loading');

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <Header />
      <main>
        <MainBanner />
        <HookSection />
        <StorytellingSection />
        <ProductShowcase />
        <OutroSection />
      </main>
      <Footer />
    </>
  );
}
```

**라인 수:** ~50줄 (기존 912줄 → 약 95% 감소)

**예상 소요 시간:** 10분

---

### Task 9 (선택): localStorage 커스텀 훅 생성
**파일:** `src/hooks/useLocalStorageData.ts`

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorageData<T>(
  key: string,
  initialData: T[]
): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          setData(JSON.parse(savedData));
        } else {
          localStorage.setItem(key, JSON.stringify(initialData));
          setData(initialData);
        }
      }
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageUpdated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdated', handleStorage);
    };
  }, [key, initialData]);

  return [data, setData];
}
```

**사용 예시:**
```typescript
// HookSection.tsx
const [allPromotions] = useLocalStorageData('admin-promotions', promotions);

// ProductShowcase.tsx
const [allProducts] = useLocalStorageData('admin-products', products);
const [categories] = useLocalStorageData('admin-categories', initialCategories);
```

**예상 소요 시간:** 20분

---

## 📋 SCSS 모듈 분리 가이드

### page.module.scss에서 추출할 스타일

1. **Preloader.module.scss**
   - `.preloader`
   - `.preloaderLogo`

2. **MainBanner.module.scss**
   - `.mainSequence`
   - `.mainSequenceBg`
   - `.bgVideo`
   - `.bgOverlay`
   - `.mainSequenceContent`
   - `.badge`
   - `.heroSubtitle`
   - `.heroTitle`
   - `.heroDescription`
   - `.ctaButton`
   - `.scrollIndicator`
   - `.scrollArrow`

3. **HookSection.module.scss**
   - `.hookSection`
   - `.hookContainer`
   - `.hookHeader`
   - `.hookTitle`
   - `.hookSubtitle`
   - `.carouselNav`
   - `.navBtn`
   - `.promoCards`
   - `.promoCard`
   - `.promoImageArea`
   - `.promoImagePlaceholder`
   - `.promoBadge`
   - `.newDot`
   - `.promoDiscount`
   - `.promoContent`
   - `.promoCardTitle`
   - `.promoCardDesc`
   - `.promoLink`

4. **StorytellingSection.module.scss**
   - `.storySection`
   - `.storyContainer`
   - `.storyHeader`
   - `.storyTitle`
   - `.storySubtitle`
   - `.storyList`
   - `.storyItem`
   - `.reverse`
   - `.storyImage`
   - `.imageWrapper`
   - `.imagePlaceholder`
   - `.placeholderIcon`
   - `.stepNumber`
   - `.storyContent`
   - `.contentLabel`
   - `.contentTitle`
   - `.contentDescription`

5. **ProductShowcase.module.scss**
   - `.productSection`
   - `.productContainer`
   - `.productHeader`
   - `.productTitle`
   - `.productSubtitle`
   - `.categoryFilter`
   - `.categoryBtn`
   - `.active`
   - `.productGrid`
   - `.productCard`
   - `.productImageArea`
   - `.productImagePlaceholder`
   - `.productBadge`
   - `.bestSeller`
   - `.productInfo`
   - `.productName`
   - `.productDesc`
   - `.productTags`
   - `.productTag`
   - `.productPrice`
   - `.originalPrice`
   - `.currentPrice`
   - `.productBtn`
   - `.viewAllContainer`
   - `.viewAllBtn`

6. **OutroSection.module.scss**
   - `.outroSection`
   - `.outroContainer`
   - `.outroContent`
   - `.outroTitle`
   - `.outroDescription`
   - `.storeCards`
   - `.storeCard`
   - `.storeIcon`
   - `.storeContent`
   - `.storeTitle`
   - `.storeDescription`

### page.module.scss에 남길 스타일
- 전역 레이아웃 관련 스타일만 유지
- `main` 태그 스타일 (있는 경우)

---

## ✅ 검증 체크리스트

리팩토링 완료 후 다음 항목들을 확인:

### 기능 테스트
- [ ] 프리로더 애니메이션 정상 작동
- [ ] 메인 배너 스크롤 고정 및 페이드 효과
- [ ] 프로모션 카드 캐러셀 정상 작동
- [ ] 스토리텔링 섹션 스크롤 애니메이션
- [ ] 제품 카테고리 필터링 정상 작동
- [ ] localStorage 데이터 로드 정상 작동
- [ ] 반응형 디자인 유지

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] Props 타입 명확히 정의됨
- [ ] GSAP cleanup 제대로 구현됨
- [ ] 중복 코드 제거됨

### 성능
- [ ] 빌드 성공 (`npm run build`)
- [ ] 번들 크기 증가 없음 (오히려 감소 예상)
- [ ] 페이지 로드 속도 유지 또는 개선

---

## ⏱️ 예상 총 소요 시간

- 데이터 분리: 10분
- Preloader: 15분
- MainBanner: 20분
- HookSection: 20분
- StorytellingSection: 20분
- ProductShowcase: 25분
- OutroSection: 15분
- 메인 페이지 통합: 10분
- 테스트 및 디버깅: 30분

**총합:** 약 2시간 45분

---

## 🎯 리팩토링 후 기대 효과

1. **유지보수성 향상**
   - 각 컴포넌트가 독립적인 파일로 분리
   - 변경 시 영향 범위가 명확함

2. **코드 가독성 향상**
   - 메인 페이지가 50줄로 간결해짐
   - 각 컴포넌트의 역할이 명확함

3. **재사용성 향상**
   - 컴포넌트를 다른 페이지에서도 사용 가능
   - Props를 통한 커스터마이징 용이

4. **협업 효율 향상**
   - Git conflict 최소화
   - 여러 개발자가 동시 작업 가능

5. **테스트 용이성**
   - 각 컴포넌트를 독립적으로 테스트 가능
   - Mock 데이터 주입이 쉬워짐

---

**작성일:** 2026-01-09
**작성자:** Frontend Developer Agent
