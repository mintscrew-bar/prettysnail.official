'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './story.module.scss';

export default function StoryPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>브랜드 스토리</h1>
          <p className={styles.subtitle}>이쁜우렁이의 이야기를 만나보세요</p>
        </div>

        <div className={styles.content}>
          <p className={styles.placeholder}>브랜드 스토리 페이지를 준비 중입니다.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
