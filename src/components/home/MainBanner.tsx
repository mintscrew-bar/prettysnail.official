'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/app/page.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function MainBanner() {
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
        scrub: 0.3, // 더 빠른 반응으로 최적화
        onUpdate: (self) => {
          const progress = self.progress;
          // 콘텐츠 페이드아웃 (처음 50%에서 사라짐)
          const contentOpacity = Math.max(0, 1 - progress * 2.5);

          // will-change 추가 및 GPU 가속
          if (contentRef.current) {
            contentRef.current.style.opacity = contentOpacity.toString();
            contentRef.current.style.transform = `translate3d(0, ${progress * -50}px, 0) scale(${1 + progress * 0.05})`;
          }

          // 오버레이가 점점 투명해지면서 영상이 드러남
          if (overlayRef.current) {
            overlayRef.current.style.opacity = (1 - progress).toString();
          }
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
          preload="metadata"
          loading="lazy"
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
}
