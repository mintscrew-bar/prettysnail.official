"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Notice } from "@/data/notices";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./detail.module.scss";

export default function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setIsLoading(true);

        // 공지사항 상세 정보 로드 (조회수 자동 증가)
        const response = await fetch(`/api/notices/${noticeId}`);
        if (response.ok) {
          const data = await response.json();
          setNotice(data);
        }

        // 전체 공지사항 로드 (이전/다음 네비게이션용)
        const allResponse = await fetch('/api/notices?all=true');
        if (allResponse.ok) {
          const allData = await allResponse.json();
          setAllNotices(allData);
        }
      } catch (error) {
        console.error('공지사항 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 이전/다음 공지사항
  const currentIndex = allNotices.findIndex((n) => n.id === noticeId);
  const prevNotice = currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  const nextNotice =
    currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!notice) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>공지사항을 찾을 수 없습니다.</p>
            <Link href="/notice" className={styles.backButton}>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 뒤로가기 버튼 */}
          <div className={styles.backNav}>
            <Link href="/notice" className={styles.backLink}>
              ← 목록으로
            </Link>
          </div>

          {/* 공지사항 헤더 */}
          <div className={styles.noticeHeader}>
            <div className={styles.badges}>
              {notice.isPinned && (
                <span className={styles.badge + " " + styles.pinnedBadge}>
                  고정
                </span>
              )}
              {notice.isImportant && (
                <span className={styles.badge + " " + styles.importantBadge}>
                  중요
                </span>
              )}
              {notice.category && (
                <span className={styles.badge + " " + styles.categoryBadge}>
                  {notice.category}
                </span>
              )}
            </div>
            <h1 className={styles.title}>{notice.title}</h1>
            <div className={styles.meta}>
              <span className={styles.date}>{formatDate(notice.date)}</span>
            </div>
          </div>

          {/* 공지사항 내용 */}
          <div className={styles.noticeBody}>
            <div className={styles.contentText}>
              {notice.content.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {/* 이전/다음 공지사항 */}
          <div className={styles.navigation}>
            {prevNotice && (
              <Link
                href={`/notice/${prevNotice.id}`}
                className={styles.navItem + " " + styles.prev}
              >
                <span className={styles.navLabel}>이전 글</span>
                <span className={styles.navTitle}>{prevNotice.title}</span>
              </Link>
            )}
            {nextNotice && (
              <Link
                href={`/notice/${nextNotice.id}`}
                className={styles.navItem + " " + styles.next}
              >
                <span className={styles.navLabel}>다음 글</span>
                <span className={styles.navTitle}>{nextNotice.title}</span>
              </Link>
            )}
          </div>

          {/* 목록으로 버튼 */}
          <div className={styles.actions}>
            <Link href="/notice" className={styles.listButton}>
              목록으로
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
