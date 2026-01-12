'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/app/page.module.scss';
import { storySteps, IconType } from '@/data/storySteps';

gsap.registerPlugin(ScrollTrigger);

// Icon 렌더링 함수
const renderIcon = (iconType: IconType) => {
  switch (iconType) {
    case 'harvest':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case 'wash':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4z" />
          <path d="M7 10h0" />
        </svg>
      );
    case 'shell':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'sterilize':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'prepare':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'package':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

export default function StorytellingSection() {
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
                    <div className={styles.placeholderIcon}>{renderIcon(step.iconType)}</div>
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
}
