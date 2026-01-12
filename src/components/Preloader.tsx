'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.scss';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
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
}
