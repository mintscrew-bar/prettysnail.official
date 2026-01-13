'use client';

import { useEffect, useState } from 'react';
import styles from './Preloader.module.scss';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 로고 애니메이션 시간 (0.8s) + 대기 (0.5s) + 펄스 (0.5s) + 대기 (0.3s) = 2.1초
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2100);

    // 전체 애니메이션 완료 후 콜백 (exit 애니메이션 0.8초 추가)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`${styles.preloader} ${isExiting ? styles.exiting : ''}`}>
      <img
        src="/logo/Asset 10.png"
        alt="이쁜우렁이"
        className={styles.preloaderLogo}
      />
    </div>
  );
}
