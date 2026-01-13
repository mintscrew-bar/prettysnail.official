'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/app/page.module.scss';

export default function OutroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30% 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="purchase" className={styles.outroSection}>
      <div className={styles.outroContainer}>
        <div className={`${styles.outroContent} ${isVisible ? styles.visible : ''}`}>
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
                <Image
                  src="/icons/NStore_1.svg"
                  alt="네이버 스토어"
                  width={60}
                  height={60}
                  priority={false}
                />
              </div>
              <div className={styles.storeContent}>
                <h3 className={styles.storeTitle}>네이버 스마트스토어</h3>
                <p className={styles.storeDescription}>네이버 쇼핑에서 간편하게</p>
              </div>
            </a>

            <a href="#" className={styles.storeCard} target="_blank" rel="noopener noreferrer">
              <div className={styles.storeIcon}>
                <Image
                  src="/icons/Asset 1.svg"
                  alt="쿠팡"
                  width={60}
                  height={60}
                  priority={false}
                />
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
}
