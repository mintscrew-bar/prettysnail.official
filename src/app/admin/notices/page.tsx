'use client';

import React, { useState, useEffect } from 'react';
import { Notice } from '@/data/notices';
import Modal from '@/components/admin/Modal';
import styles from '../admin.module.scss';

export default function NoticesManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 인증은 middleware에서 처리됨 (JWT 쿠키 검증)

  const [formData, setFormData] = useState<Partial<Notice>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    isPinned: false,
    isImportant: false,
    category: '공지',
    views: 0,
  });

  // API에서 공지사항 로드
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notices?all=true');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 공지사항 목록
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 날짜순 정렬 (최신순, 고정 공지 우선)
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 모달 열기
  const openModal = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData(notice);
    } else {
      setEditingNotice(null);
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        isPinned: false,
        isImportant: false,
        category: '공지',
        views: 0,
      });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  // 공지사항 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      if (editingNotice) {
        // 수정
        const response = await fetch(`/api/notices/${editingNotice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedNotice = await response.json();
          setNotices(notices.map((n) => (n.id === editingNotice.id ? updatedNotice : n)));
          closeModal();
        } else {
          throw new Error('수정 실패');
        }
      } else {
        // 추가
        const response = await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newNotice = await response.json();
          setNotices([newNotice, ...notices]);
          closeModal();
        } else {
          throw new Error('추가 실패');
        }
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 공지사항 삭제
  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/notices/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNotices(notices.filter((n) => n.id !== id));
        } else {
          throw new Error('삭제 실패');
        }
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        alert('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className={styles.managementPage}>
        <div className={styles.loadingState}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.managementPage}>
      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageInfo}>
          <h2 className={styles.sectionTitle}>공지사항 관리</h2>
          <p className={styles.pageDesc}>공지사항을 추가, 수정, 삭제할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          + 새 공지사항 추가
        </button>
      </div>

      {/* 필터 & 검색 */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilter}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체 카테고리</option>
            <option value="공지">공지</option>
            <option value="이벤트">이벤트</option>
            <option value="안내">안내</option>
          </select>
        </div>
      </div>

      {/* 공지사항 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>날짜</th>
              <th>조회수</th>
              <th>고정</th>
              <th>중요</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {sortedNotices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              sortedNotices.map((notice) => (
                <tr key={notice.id}>
                  <td>{notice.id}</td>
                  <td className={styles.noticeTitle}>
                    {notice.title}
                  </td>
                  <td>
                    <span className={styles.badge}>
                      {notice.category}
                    </span>
                  </td>
                  <td>{formatDate(notice.date)}</td>
                  <td>{notice.views || 0}</td>
                  <td>{notice.isPinned ? 'O' : '-'}</td>
                  <td>{notice.isImportant ? 'O' : '-'}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        onClick={() => openModal(notice)}
                        className={styles.editBtn}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className={styles.deleteBtn}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingNotice ? '공지사항 수정' : '공지사항 추가'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title">제목 *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">카테고리 *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.select}
                    required
                  >
                    <option value="공지">공지</option>
                    <option value="이벤트">이벤트</option>
                    <option value="안내">안내</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date">날짜 *</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content">내용 *</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={styles.textarea}
                  rows={10}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    />
                    <span>상단 고정</span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.isImportant}
                      onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    />
                    <span>중요 공지</span>
                  </label>
                </div>
              </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={closeModal} className={styles.cancelBtn}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? '저장 중...' : editingNotice ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
