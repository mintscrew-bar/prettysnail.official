'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '@/app/page.module.scss';
import { storySteps, IconType } from '@/data/storySteps';

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            // 한 번 나타난 후에는 다시 관찰하지 않음
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    const items = sectionRef.current?.querySelectorAll(`.${styles.storyItem}`);
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
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
                  <Image
                    src={`/images/story/${step.image}`}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y3ZjNlYiIvPjwvc3ZnPg=="
                  />
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
