'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/app/page.module.scss';
import { promotions } from '@/data/promotions';

gsap.registerPlugin(ScrollTrigger);

export default function HookSection() {
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
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 400px"
                    style={{ objectFit: 'cover' }}
                    priority={false}
                  />
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
}
