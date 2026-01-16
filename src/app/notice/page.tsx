'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './notice.module.scss';
import { Notice } from '@/data/notices';

export default function NoticePage() {
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // API에서 공지사항 데이터 로드
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notices?all=true');
        if (response.ok) {
          const data = await response.json();
          setAllNotices(data);
        }
      } catch (error) {
        console.error('공지사항 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 카테고리 필터링 및 정렬
  useEffect(() => {
    let filtered = allNotices;

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = allNotices.filter((notice) => notice.category === selectedCategory);
    }

    // 날짜순 정렬 (최신순) - 고정 공지는 항상 상단
    filtered = [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredNotices(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  }, [allNotices, selectedCategory]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {isLoading ? (
              <div className={styles.emptyState}>
                <p>공지사항을 불러오는 중...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className={styles.emptyState}>
                <p>등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              currentNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className={`${styles.noticeItem} ${notice.isPinned ? styles.pinned : ''}`}
                >
                  <div className={styles.noticeHeader}>
                    <div className={styles.badges}>
                      {notice.isPinned && (
                        <span className={styles.badge + ' ' + styles.pinnedBadge}>
                          고정
                        </span>
                      )}
                      {notice.isImportant && (
                        <span className={styles.badge + ' ' + styles.importantBadge}>
                          중요
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
                    <span className={styles.readMore}>자세히 보기 →</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
