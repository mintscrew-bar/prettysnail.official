'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 열림/닫힘 시 body 스크롤 제어
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logo}>
          <img src="/logo/Asset 2.png" alt="" className={styles.logoImage} />
          <span className={styles.logoText}>이쁜우렁이</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/products" className={styles.navLink}>
            제품
          </Link>
          <Link href="/#story" className={styles.navLink}>
            스토리
          </Link>
          <Link href="/#contact" className={styles.navLink}>
            문의
          </Link>
        </nav>
        <button
          className={styles.menuBtn}
          onClick={toggleMobileMenu}
          aria-label="메뉴"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* 모바일 메뉴 */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu}></div>
        <nav className={styles.mobileNav}>
          <Link href="/products" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            제품
          </Link>
          <Link href="/#story" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            스토리
          </Link>
          <Link href="/#contact" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            문의
          </Link>
        </nav>
      </div>
    </>
  );
}
