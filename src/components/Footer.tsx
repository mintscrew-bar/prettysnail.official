'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>이쁜우렁이</h3>
          <p className={styles.footerDesc}>
            HACCP 인증, 무항생제 사료로 건강하게 키운 우렁이
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>바로가기</h4>
          <div className={styles.footerLinks}>
            <Link href="/products">제품</Link>
            <Link href="/#story">스토리</Link>
            <Link href="/#contact">문의</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>고객센터</h4>
          <div className={styles.footerContact}>
            <p>전화: 010-0000-0000</p>
            <p>이메일: contact@prettysnail.com</p>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>판매처</h4>
          <div className={styles.footerLinks}>
            <a href="#">네이버 스마트스토어</a>
            <a href="#">쿠팡</a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerInfo}>
          <p>상호명: 이쁜우렁이 | 대표: 홍길동</p>
          <p>사업자등록번호: 000-00-00000 | 통신판매업신고: 제0000-경산-0000호</p>
          <p>주소: 경상북도 경산시</p>
          <p>이메일: contact@prettysnail.com | 전화: 010-0000-0000</p>
        </div>
        <div className={styles.footerLegal}>
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
        </div>
        <p className={styles.footerCopyright}>
          © 2024 이쁜우렁이. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
