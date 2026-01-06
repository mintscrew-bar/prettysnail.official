'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './notice.module.scss';
import { notices, Notice } from '@/data/notices';

export default function NoticePage() {
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // localStorage에서 공지사항 데이터 로드
  useEffect(() => {
    const loadNotices = () => {
      if (typeof window !== 'undefined') {
        const savedNotices = localStorage.getItem('admin-notices');
        if (savedNotices) {
          const loadedNotices = JSON.parse(savedNotices);
          setAllNotices(loadedNotices);
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-notices', JSON.stringify(notices));
          setAllNotices(notices);
        }
      }
    };

    loadNotices();

    // storage 이벤트 리스너
    window.addEventListener('storage', loadNotices);
    window.addEventListener('localStorageUpdated', loadNotices);

    return () => {
      window.removeEventListener('storage', loadNotices);
      window.removeEventListener('localStorageUpdated', loadNotices);
    };
  }, []);

  // 카테고리 필터링 및 정렬
  useEffect(() => {
    let filtered = allNotices;

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = allNotices.filter((notice) => notice.category === selectedCategory);
    }

    // 날짜순 정렬 (최신순) - 고정 공지는 항상 상단
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredNotices(filtered);
  }, [allNotices, selectedCategory]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체' },
    { id: '공지', name: '공지' },
    { id: '이벤트', name: '이벤트' },
    { id: '안내', name: '안내' },
  ];

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>공지사항</h1>
          <p className={styles.subtitle}>이쁜우렁이의 새로운 소식을 확인하세요</p>
        </div>

        <div className={styles.content}>
          {/* 카테고리 필터 */}
          <div className={styles.categoryFilter}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${styles.categoryBtn} ${
                  selectedCategory === cat.id ? styles.active : ''
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 공지사항 목록 */}
          <div className={styles.noticeList}>
            {filteredNotices.length === 0 ? (
              <div className={styles.emptyState}>
                <p>등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className={`${styles.noticeItem} ${notice.isPinned ? styles.pinned : ''}`}
                >
                  <div className={styles.noticeHeader}>
                    <div className={styles.badges}>
                      {notice.isPinned && (
                        <span className={styles.badge + ' ' + styles.pinnedBadge}>
                          📌 고정
                        </span>
                      )}
                      {notice.isImportant && (
                        <span className={styles.badge + ' ' + styles.importantBadge}>
                          ⭐ 중요
                        </span>
                      )}
                      {notice.category && (
                        <span className={styles.badge + ' ' + styles.categoryBadge}>
                          {notice.category}
                        </span>
                      )}
                    </div>
                    <div className={styles.date}>{formatDate(notice.date)}</div>
                  </div>
                  <h2 className={styles.noticeTitle}>{notice.title}</h2>
                  <p className={styles.noticePreview}>
                    {notice.content.substring(0, 100)}
                    {notice.content.length > 100 && '...'}
                  </p>
                  <div className={styles.noticeFooter}>
                    <span className={styles.viewCount}>
                      👁️ {notice.views || 0}
                    </span>
                    <span className={styles.readMore}>자세히 보기 →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
