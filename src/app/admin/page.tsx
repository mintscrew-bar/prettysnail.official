'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.scss';

interface Stat {
  label: string;
  value: string;
  icon: string;
  href: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([
    { label: '전체 제품', value: '-', icon: '📦', href: '/admin/products' },
    { label: '활성 프로모션', value: '-', icon: '🎉', href: '/admin/promotions' },
    { label: '공지사항', value: '-', icon: '📢', href: '/admin/notices' },
    { label: '카테고리', value: '-', icon: '📁', href: '/admin/categories' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 통계 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/db/init');
        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats([
              { label: '전체 제품', value: data.stats.products.toString(), icon: '📦', href: '/admin/products' },
              { label: '활성 프로모션', value: data.stats.promotions.toString(), icon: '🎉', href: '/admin/promotions' },
              { label: '공지사항', value: data.stats.notices.toString(), icon: '📢', href: '/admin/notices' },
              { label: '카테고리', value: (data.stats.categories - 1).toString(), icon: '📁', href: '/admin/categories' }, // 'all' 제외
            ]);
          }
        }
      } catch (error) {
        console.error('통계 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>환영합니다! 👋</h2>
        <p className={styles.welcomeText}>
          이쁜우렁이 관리자 대시보드입니다. 제품과 프로모션을 관리할 수 있어요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                {isLoading ? '...' : stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* 빠른 액션 */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>빠른 작업</h3>
        <div className={styles.actionGrid}>
          <Link href="/admin/products" className={styles.actionCard}>
            <div className={styles.actionIcon}>➕</div>
            <div className={styles.actionTitle}>새 제품 추가</div>
            <div className={styles.actionDesc}>새로운 제품을 등록하세요</div>
          </Link>

          <Link href="/admin/promotions" className={styles.actionCard}>
            <div className={styles.actionIcon}>🎨</div>
            <div className={styles.actionTitle}>프로모션 만들기</div>
            <div className={styles.actionDesc}>이벤트나 할인을 추가하세요</div>
          </Link>

          <Link href="/admin/notices" className={styles.actionCard}>
            <div className={styles.actionIcon}>📢</div>
            <div className={styles.actionTitle}>공지사항 작성</div>
            <div className={styles.actionDesc}>새로운 소식을 알려주세요</div>
          </Link>

          <Link href="/" className={styles.actionCard}>
            <div className={styles.actionIcon}>👁️</div>
            <div className={styles.actionTitle}>사이트 미리보기</div>
            <div className={styles.actionDesc}>변경사항을 확인하세요</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
