"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Notice } from "@/data/notices";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./detail.module.scss";

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotices = localStorage.getItem("admin-notices");
      if (savedNotices) {
        const notices: Notice[] = JSON.parse(savedNotices);
        setAllNotices(notices);

        const currentNotice = notices.find((n) => n.id === noticeId);
        if (currentNotice) {
          setNotice(currentNotice);

          // 세션 내 중복 조회 방지
          const viewedKey = `notice-viewed-${noticeId}`;
          const hasViewed = sessionStorage.getItem(viewedKey);

          if (!hasViewed) {
            // 조회수 증가 (처음 조회하는 경우만)
            const updatedNotices = notices.map((n) =>
              n.id === noticeId ? { ...n, views: (n.views || 0) + 1 } : n
            );

            // 저장 및 로컬 상태 갱신
            localStorage.setItem("admin-notices", JSON.stringify(updatedNotices));
            const updatedNotice =
              updatedNotices.find((n) => n.id === noticeId) || null;
            setAllNotices(updatedNotices);
            setNotice(updatedNotice);

            // 세션에 조회 기록 저장
            sessionStorage.setItem(viewedKey, "true");

            // 같은 탭에서 변경사항을 반영하기 위한 커스텀 이벤트
            window.dispatchEvent(new Event("localStorageUpdated"));
          }
        }
      }
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
                  📌 고정
                </span>
              )}
              {notice.isImportant && (
                <span className={styles.badge + " " + styles.importantBadge}>
                  ⭐ 중요
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
