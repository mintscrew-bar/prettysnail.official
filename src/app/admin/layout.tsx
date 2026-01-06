'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.scss';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 로딩 상태 해제
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
        });
        router.push('/admin/login');
      } catch (error) {
        console.error('Logout error:', error);
        // 에러가 발생해도 로그인 페이지로 이동
        router.push('/admin/login');
      }
    }
  };

  // 로그인 페이지는 레이아웃 없이 렌더링
  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  const menuItems = [
    { href: '/admin', label: '대시보드', icon: '📊' },
    { href: '/admin/products', label: '제품 관리', icon: '📦' },
    { href: '/admin/promotions', label: '프로모션 관리', icon: '🎉' },
    { href: '/admin/categories', label: '카테고리 관리', icon: '📁' },
    { href: '/admin/settings', label: '설정', icon: '⚙️' },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* 사이드바 오버레이 (모바일) */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* 사이드바 */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            <span className={styles.logoIcon}>🐌</span>
            <span className={styles.logoText}>이쁜우렁이</span>
          </Link>
          <button
            className={styles.toggleBtn}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              onClick={() => {
                // 모바일에서 메뉴 선택 시 사이드바 닫기
                if (window.innerWidth <= 768) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backToSite}>
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          {/* 모바일 메뉴 버튼 */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="메뉴"
          >
            ☰
          </button>

          <h1 className={styles.pageTitle}>관리자 페이지</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>관리자</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>

        <div className={styles.contentArea}>{children}</div>
      </main>
    </div>
  );
}
