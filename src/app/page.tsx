'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.scss';
import { promotions, PromotionCard } from '@/data/promotions';
import { products, categories as initialCategories } from '@/data/products';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 프리로더 컴포넌트
// ==========================================
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // 로고 등장 애니메이션
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.7, rotate: -10 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }
    )
      // 잠시 대기
      .to(logoRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.inOut',
        delay: 0.5,
      })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.inOut',
      })
      // 프리로더 전체가 위로 사라짐
      .to(preloaderRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut',
        delay: 0.3,
      });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={preloaderRef} className={styles.preloader}>
      <img
        ref={logoRef}
        src="/logo/Asset 10.png"
        alt="이쁜우렁이"
        className={styles.preloaderLogo}
      />
    </div>
  );
};

// ==========================================
// 메인 배너 섹션
// ==========================================
const MainBanner = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 초기 요소 애니메이션 (프리로더 완료 후 실행)
      const tl = gsap.timeline({
        delay: 2.8, // 프리로더 애니메이션 시간 고려
      });

      tl.to(`.${styles.badge}`, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
        .to(
          `.${styles.heroSubtitle}`,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .to(
          `.${styles.heroTitle}`,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.4'
        )
        .to(
          `.${styles.heroDescription}`,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.4'
        )
        .to(
          `.${styles.ctaButton}`,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .to(
          `.${styles.scrollIndicator}`,
          {
            opacity: 0.7,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.2'
        );

      // 배너 고정 & 스크롤 시 오버레이 걷힘
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=150%', // 화면 1.5배 높이만큼 스크롤해야 고정 해제
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          // 콘텐츠 페이드아웃 (처음 50%에서 사라짐)
          const contentOpacity = Math.max(0, 1 - progress * 2.5);
          gsap.set(contentRef.current, {
            opacity: contentOpacity,
            scale: 1 + progress * 0.05,
            y: progress * -50,
          });
          // 오버레이가 점점 투명해지면서 영상이 드러남
          gsap.set(overlayRef.current, {
            opacity: 1 - progress,
          });
        },
      });

      // 모바일에서 ScrollTrigger 새로고침
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.mainSequence}>
      <div className={styles.mainSequenceBg}>
        <video
          className={styles.bgVideo}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/banner/7.png"
        >
          <source src="/images/banner/farm.mp4" type="video/mp4" />
        </video>
        <div ref={overlayRef} className={styles.bgOverlay}></div>
      </div>
      <div ref={contentRef} className={styles.mainSequenceContent}>
        {/* 인증 배지 */}
        <div className={styles.badge}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          HACCP 인증 시설
        </div>

        {/* 서브타이틀 */}
        <p className={styles.heroSubtitle}>
          HACCP 인증과 무항생제 사료, 그리고 국내산
        </p>

        {/* 메인 타이틀 */}
        <h1 className={styles.heroTitle}>안심하고 먹는 즐거움</h1>

        {/* 설명 */}
        <p className={styles.heroDescription}>
          이쁜우렁이는 무항생제 사료를 아낌없이 사용해 우렁이를 키우고 있어요.
          <br />
          HACCP 인증시설에서 까기 번거로운 껍질을 탈각해서
          <br />
          좋은 것들만 꼼꼼히 선별해 마음을 전하고 있어요.
          <br />
          무엇보다 국내산이라는 점!
        </p>

        {/* CTA 버튼 */}
        <a href="#products" className={styles.ctaButton}>
          제품 둘러보기
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>

        {/* 스크롤 인디케이터 */}
        <div className={styles.scrollIndicator}>
          <span>Scroll</span>
          <svg
            className={styles.scrollArrow}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 인트로/후크 섹션 (이벤트/프로모션 카드)
// ==========================================
const HookSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [allPromotions, setAllPromotions] = useState(promotions);

  // localStorage에서 프로모션 데이터 로드 및 초기화
  useEffect(() => {
    const loadPromotions = () => {
      if (typeof window !== 'undefined') {
        const savedPromotions = localStorage.getItem('admin-promotions');
        if (savedPromotions) {
          const loadedPromotions = JSON.parse(savedPromotions);
          setAllPromotions(loadedPromotions);
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-promotions', JSON.stringify(promotions));
          setAllPromotions(promotions);
        }
      }
    };

    loadPromotions();

    // storage 이벤트 리스너 (다른 탭에서 변경 시 감지)
    window.addEventListener('storage', loadPromotions);

    // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
    const handleStorageChange = () => loadPromotions();
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', loadPromotions);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => setIsVisible(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scroll = (direction: 'prev' | 'next') => {
    if (!cardsRef.current) return;
    const cardWidth = cardsRef.current.querySelector(`.${styles.promoCard}`)?.clientWidth || 300;
    const scrollAmount = direction === 'next' ? cardWidth + 24 : -(cardWidth + 24);
    cardsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={styles.hookSection}>
      <div className={styles.hookContainer}>
        <div className={styles.hookHeader}>
          <div>
            <h2 className={styles.hookTitle}>소식 & 이벤트</h2>
            <p className={styles.hookSubtitle}>이쁜우렁이의 새로운 소식을 만나보세요</p>
          </div>
          <div className={styles.carouselNav}>
            <button
              className={styles.navBtn}
              onClick={() => scroll('prev')}
              aria-label="이전"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className={styles.navBtn}
              onClick={() => scroll('next')}
              aria-label="다음"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={cardsRef} className={`${styles.promoCards} ${isVisible ? styles.visible : ''}`}>
          {allPromotions.map((promo) => (
            <a
              key={promo.id}
              href={promo.link || '#'}
              className={styles.promoCard}
            >
              <div className={styles.promoImageArea}>
                {promo.image ? (
                  <img src={promo.image} alt={promo.title} />
                ) : (
                  <div className={styles.promoImagePlaceholder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {promo.badge && (
                  <span className={styles.promoBadge}>
                    {promo.isNew && <span className={styles.newDot}></span>}
                    {promo.badge}
                  </span>
                )}
                {promo.discount && (
                  <span className={styles.promoDiscount}>{promo.discount}</span>
                )}
              </div>
              <div className={styles.promoContent}>
                <h3 className={styles.promoCardTitle}>{promo.title}</h3>
                <p className={styles.promoCardDesc}>{promo.description}</p>
                <span className={styles.promoLink}>
                  자세히 보기
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 스토리텔링 섹션
// ==========================================
const storySteps = [
  {
    id: 1,
    label: '수확',
    title: '신선한 우렁이 원물',
    description:
      '맑은 물에서 정성껏 양식한 국내산 우렁이를 수확합니다. 무항생제 사료만 사용해 건강하게 키운 우렁이예요.',
    image: '원물.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    label: '세척',
    title: '탈각 전 꼼꼼한 세척',
    description:
      'HACCP 인증 시설에서 위생적으로 세척합니다. 껍질을 완벽하게 제거하기 위한 첫 단계예요.',
    image: '탈각 전.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4z" />
        <path d="M7 10h0" />
      </svg>
    ),
  },
  {
    id: 3,
    label: '탈각',
    title: '껍질 제거 및 이물질 제거',
    description:
      '껍질 탈각 후 숙련된 작업자가 추가적인 이물질이나 불순물을 거르고 좋은 우렁이를 선별해요.',
    image: '탈각 및 이물질 제거 후.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    id: 4,
    label: '멸균',
    title: '위생적인 멸균 공정',
    description:
      '엄격한 위생 기준에 따라 멸균 처리합니다. 안심하고 드실 수 있도록 철저하게 관리해요.',
    image: '멸균 공정 후.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 5,
    label: '손질',
    title: '최종 손질 완료',
    description:
      '완벽하게 손질 된 우렁이입니다. 바로 요리에 사용할 수 있어요.',
    image: '손질 완료.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 6,
    label: '포장',
    title: '신선함을 그대로 담아',
    description:
      '위생적으로 포장하여 신선함을 유지한 채 고객님께 전달됩니다. 국내산 우렁이의 맛을 그대로 느껴보세요.',
    image: '1.jpg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

const StorytellingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(`.${styles.storyItem}`);

      items.forEach((item: any, index) => {
        const image = item.querySelector(`.${styles.storyImage}`);
        const content = item.querySelector(`.${styles.storyContent}`);

        // 이미지 스케일 & 페이드 인 효과
        gsap.fromTo(
          image,
          {
            opacity: 0,
            scale: 0.85,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 75%',
              end: 'top 25%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // 텍스트 슬라이드 인 효과
        gsap.fromTo(
          content,
          {
            opacity: 0,
            x: index % 2 === 0 ? -60 : 60,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 75%',
              end: 'top 25%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className={styles.storySection}>
      <div className={styles.storyContainer}>
        <div className={styles.storyHeader}>
          <h2 className={styles.storyTitle}>우리의 이야기</h2>
          <p className={styles.storySubtitle}>
            정성을 담아 키우고, 꼼꼼히 선별해서 전해드려요
          </p>
        </div>

        <div className={styles.storyList}>
          {storySteps.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.storyItem} ${index % 2 === 1 ? styles.reverse : ''}`}
            >
              <div className={styles.storyImage}>
                <div className={styles.imageWrapper}>
                  <img
                    src={`/images/story/${step.image}`}
                    alt={step.title}
                    onError={(e) => {
                      // 이미지 로드 실패 시 플레이스홀더 표시
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.placeholderIcon}>{step.icon}</div>
                  </div>
                </div>
                <span className={styles.stepNumber}>{step.id}</span>
              </div>
              <div className={styles.storyContent}>
                <span className={styles.contentLabel}>{step.label}</span>
                <h3 className={styles.contentTitle}>{step.title}</h3>
                <p className={styles.contentDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 제품 쇼케이스 섹션
// ==========================================
const ProductShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState(products);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [categories, setCategories] = useState(initialCategories);

  // localStorage에서 제품 데이터 로드 및 초기화
  useEffect(() => {
    const loadProducts = () => {
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem('admin-products');
        if (savedProducts) {
          const loadedProducts = JSON.parse(savedProducts);
          setAllProducts(loadedProducts);
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-products', JSON.stringify(products));
          setAllProducts(products);
        }
      }
    };

    const loadCategories = () => {
      if (typeof window !== 'undefined') {
        const savedCategories = localStorage.getItem('admin-categories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-categories', JSON.stringify(initialCategories));
          setCategories(initialCategories);
        }
      }
    };

    loadProducts();
    loadCategories();

    // storage 이벤트 리스너 (다른 탭에서 변경 시 감지)
    const handleStorage = () => {
      loadProducts();
      loadCategories();
    };
    window.addEventListener('storage', handleStorage);

    // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
    const handleStorageChange = () => {
      loadProducts();
      loadCategories();
    };
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, allProducts]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.productCard}`,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // 필터 변경 시 애니메이션
    gsap.fromTo(
      `.${styles.productCard}`,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'back.out(1.2)',
      }
    );
  };

  return (
    <section ref={sectionRef} id="products" className={styles.productSection}>
      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <h2 className={styles.productTitle}>우리의 제품</h2>
          <p className={styles.productSubtitle}>
            신선하고 건강한 먹거리를 전해드려요
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className={styles.categoryFilter}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`${styles.categoryBtn} ${
                selectedCategory === cat.id ? styles.active : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 제품 그리드 */}
        <div className={styles.productGrid}>
          {filteredProducts.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.productCard}
              data-category={product.category}
            >
              <div className={styles.productImageArea}>
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {product.isNew && <span className={styles.productBadge}>NEW</span>}
                {product.isBestSeller && (
                  <span className={`${styles.productBadge} ${styles.bestSeller}`}>
                    BEST
                  </span>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                {product.tags && (
                  <div className={styles.productTags}>
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className={styles.productTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.productPrice}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {product.price.toLocaleString()}원
                  </span>
                </div>
                <div className={styles.productBtn}>
                  구매하기
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 전체 제품 보기 */}
        <div className={styles.viewAllContainer}>
          <Link href="/products" className={styles.viewAllBtn}>
            전체 제품 보기
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 아웃트로/CTA 섹션
// ==========================================
const OutroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.outroContent}`,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="purchase" className={styles.outroSection}>
      <div className={styles.outroContainer}>
        <div className={styles.outroContent}>
          <h2 className={styles.outroTitle}>
            이쁜우렁이,
            <br />
            어디서 만나볼까요?
          </h2>
          <p className={styles.outroDescription}>
            네이버 스마트스토어와 쿠팡에서 만나보실 수 있어요.
            <br />
            편하신 곳에서 구매하시고, 궁금한 점은 언제든 문의주세요!
          </p>

          <div className={styles.storeCards}>
            <a href="#" className={styles.storeCard} target="_blank" rel="noopener noreferrer">
              <div className={styles.storeIcon}>
                <img src="/icons/NStore_1.svg" alt="네이버 스토어" />
              </div>
              <div className={styles.storeContent}>
                <h3 className={styles.storeTitle}>네이버 스마트스토어</h3>
                <p className={styles.storeDescription}>네이버 쇼핑에서 간편하게</p>
              </div>
            </a>

            <a href="#" className={styles.storeCard} target="_blank" rel="noopener noreferrer">
              <div className={styles.storeIcon}>
                <img src="/icons/Asset 1.svg" alt="쿠팡" />
              </div>
              <div className={styles.storeContent}>
                <h3 className={styles.storeTitle}>쿠팡</h3>
                <p className={styles.storeDescription}>빠른 배송으로 받아보세요</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 메인 페이지
// ==========================================
export default function Homepage() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    document.body.classList.remove('loading');
  };

  useEffect(() => {
    // 페이지 로드 시 스크롤을 최상단으로
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
