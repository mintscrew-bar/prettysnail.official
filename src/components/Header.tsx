'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './Header.module.scss';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      >
        <a href="/" className={styles.logo}>
          <img src="/logo/Asset 2.png" alt="" className={styles.logoImage} />
          <span className={styles.logoText}>이쁜우렁이</span>
        </a>
        <nav className={styles.nav}>
          <a href="/products" className={styles.navLink}>
            제품
          </a>
          <a href="/story" className={styles.navLink}>
            스토리
          </a>
          <a href="/notice" className={styles.navLink}>
            공지사항
          </a>
          <a href="/support" className={styles.navLink}>
            고객지원
          </a>
        </nav>
        <button
          className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* 모바일 메뉴 */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNav}>
          <a href="/products" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
            제품
          </a>
          <a href="/story" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
            스토리
          </a>
          <a href="/notice" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
            공지사항
          </a>
          <a href="/support" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
            고객지원
          </a>
        </nav>
      </div>

      {/* 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}
