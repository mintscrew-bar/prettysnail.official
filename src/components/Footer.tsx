'use client';

import React from 'react';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <img src="/logo/Asset 2.png" alt="이쁜우렁이" />
              <span>이쁜우렁이</span>
            </div>
            <p className={styles.footerTagline}>
              HACCP 인증 시설에서 만든
              <br />
              안심하고 먹는 건강한 우렁이
            </p>
            <div className={styles.footerSocial}>
              <a href="#" aria-label="카카오톡 채널">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
              </a>
              <a href="#" aria-label="네이버 톡톡" className={styles.naverIcon}>
                N
              </a>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h3>제품</h3>
              <a href="#products">우렁이살</a>
              <a href="#products">냉동 우렁이</a>
              <a href="#products">건조 우렁이</a>
            </div>
            <div className={styles.footerColumn}>
              <h3>회사</h3>
              <a href="#story">우리 이야기</a>
              <a href="#purchase">문의하기</a>
              <a href="#">찾아오시는 길</a>
            </div>
            <div className={styles.footerColumn}>
              <h3>고객지원</h3>
              <a href="#">자주 묻는 질문</a>
              <a href="#">배송 안내</a>
              <a href="#">환불 정책</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerInfo}>
            <p>상호명: 영어조합법인 이쁜우렁이 | 대표: 김선하</p>
            <p>주소: 부산 강서구 입소정관길 134-78</p>
            <p>사업자등록번호: - | 통신판매업신고: -</p>
          </div>
          <p className={styles.footerCopyright}>
            © 2026 이쁜우렁이. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
