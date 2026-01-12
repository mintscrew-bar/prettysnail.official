'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import styles from './Header.module.scss';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 애니메이션
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const ctx = gsap.context(() => {
      const menuLinks = mobileMenuRef.current?.querySelectorAll(`.${styles.mobileNavLink}`);

      if (isMobileMenuOpen) {
        // 메뉴 열기
        const tl = gsap.timeline();

        // 오버레이 페이드 인
        if (overlayRef.current) {
          tl.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' },
            0
          );
        }

        // 드로어 슬라이드 인
        tl.fromTo(
          mobileMenuRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
          0
        );

        // 메뉴 아이템 순차 등장
        if (menuLinks) {
          tl.fromTo(
            menuLinks,
            {
              opacity: 0,
              x: 50,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              stagger: 0.08,
              ease: 'power2.out',
            },
            0.2
          );
        }

        // Body 스크롤 락
        document.body.style.overflow = 'hidden';
      } else {
        // 메뉴 닫기
        const tl = gsap.timeline();

        // 메뉴 아이템 순차 사라짐
        if (menuLinks) {
          tl.to(menuLinks, {
            opacity: 0,
            x: 30,
            duration: 0.2,
            stagger: 0.04,
            ease: 'power2.in',
          });
        }

        // 드로어 슬라이드 아웃
        tl.to(
          mobileMenuRef.current,
          {
            x: '100%',
            duration: 0.3,
            ease: 'power3.in',
          },
          0.1
        );

        // 오버레이 페이드 아웃
        if (overlayRef.current) {
          tl.to(
            overlayRef.current,
            {
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in',
            },
            0.1
          );
        }

        // Body 스크롤 락 해제
        document.body.style.overflow = '';
      }
    }, mobileMenuRef);

    return () => {
      ctx.revert();
      // 컴포넌트 언마운트 시 스크롤 락 해제
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

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
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* 모바일 메뉴 */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className={styles.mobileNav}>
          <a
            href="/products"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            제품
          </a>
          <a
            href="/story"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            스토리
          </a>
          <a
            href="/notice"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            공지사항
          </a>
          <a
            href="/support"
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            고객지원
          </a>
        </nav>
      </div>

      {/* 오버레이 */}
      {isMobileMenuOpen && (
        <div
          ref={overlayRef}
          className={styles.mobileMenuOverlay}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
