'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.scss';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: '전체 제품', value: '0', icon: '📦', href: '/admin/products' },
    { label: '활성 프로모션', value: '0', icon: '🎉', href: '/admin/promotions' },
    { label: '공지사항', value: '0', icon: '📢', href: '/admin/notices' },
    { label: '카테고리', value: '0', icon: '📁', href: '/admin/categories' },
  ]);

  // localStorage에서 실제 데이터 로드 및 통계 계산
  useEffect(() => {
    const loadStats = () => {
      if (typeof window !== 'undefined') {
        // 제품 개수
        const savedProducts = localStorage.getItem('admin-products');
        const productsCount = savedProducts ? JSON.parse(savedProducts).length : 0;

        // 프로모션 개수
        const savedPromotions = localStorage.getItem('admin-promotions');
        const promotionsCount = savedPromotions ? JSON.parse(savedPromotions).length : 0;

        // 공지사항 개수
        const savedNotices = localStorage.getItem('admin-notices');
        const noticesCount = savedNotices ? JSON.parse(savedNotices).length : 0;

        // 카테고리 개수 ('all' 제외)
        const savedCategories = localStorage.getItem('admin-categories');
        const categoriesCount = savedCategories
          ? JSON.parse(savedCategories).filter((cat: any) => cat.id !== 'all').length
          : 0;

        setStats([
          { label: '전체 제품', value: productsCount.toString(), icon: '📦', href: '/admin/products' },
          { label: '활성 프로모션', value: promotionsCount.toString(), icon: '🎉', href: '/admin/promotions' },
          { label: '공지사항', value: noticesCount.toString(), icon: '📢', href: '/admin/notices' },
          { label: '카테고리', value: categoriesCount.toString(), icon: '📁', href: '/admin/categories' },
        ]);
      }
    };

    loadStats();

    // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
    const handleStorageChange = () => loadStats();
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
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
              <div className={styles.statValue}>{stat.value}</div>
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
