'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.scss';

interface Category {
  id: string;
  name: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // API에서 카테고리 로드
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열기
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({ id: '', name: '' });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ id: '', name: '' });
  };

  // 카테고리 저장
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      if (editingCategory) {
        // 수정
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name.trim() }),
        });

        if (response.ok) {
          const updatedCategory = await response.json();
          setCategories(
            categories.map((cat) =>
              cat.id === editingCategory.id ? updatedCategory : cat
            )
          );
          closeModal();
        } else {
          const error = await response.json();
          throw new Error(error.error || '수정 실패');
        }
      } else {
        // 추가
        const categoryId = formData.name.trim();
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: categoryId,
            name: formData.name.trim(),
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          setCategories([...categories, newCategory]);
          closeModal();
        } else {
          const error = await response.json();
          if (response.status === 409) {
            alert('이미 존재하는 카테고리입니다.');
          } else {
            throw new Error(error.error || '추가 실패');
          }
        }
      }
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
      alert(error instanceof Error ? error.message : '카테고리 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 카테고리 삭제
  const handleDelete = async (category: Category) => {
    // 'all' 카테고리는 삭제 불가
    if (category.id === 'all') {
      alert('"전체" 카테고리는 삭제할 수 없습니다.');
      return;
    }

    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== category.id));
      } else {
        const error = await response.json();
        throw new Error(error.error || '삭제 실패');
      }
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert(error instanceof Error ? error.message : '카테고리 삭제에 실패했습니다.');
    }
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
          <h2 className={styles.sectionTitle}>카테고리 관리</h2>
          <p className={styles.pageDesc}>제품 카테고리를 관리할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          + 새 카테고리 추가
        </button>
      </div>

      {/* 카테고리 그리드 */}
      <div className={styles.promoGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.promoCard}>
            <div className={styles.promoContent}>
              <h3 className={styles.promoTitle}>{category.name}</h3>
              <p className={styles.promoDesc}>ID: {category.id}</p>
            </div>

            <div className={styles.promoActions}>
              <div className={styles.actionBtns}>
                <button
                  className={styles.editBtn}
                  onClick={() => openModal(category)}
                  disabled={category.id === 'all'}
                >
                  수정
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(category)}
                  disabled={category.id === 'all'}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className={styles.emptyState}>
          <p>카테고리가 없습니다.</p>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={closeModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingCategory ? '카테고리 수정' : '새 카테고리 추가'}</h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>카테고리 이름 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 우렁이, 채소, 밀키트"
                />
              </div>

              {editingCategory && (
                <div className={styles.formGroup}>
                  <label>ID (수정 불가)</label>
                  <input type="text" value={editingCategory.id} disabled />
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>
                취소
              </button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : editingCategory ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
