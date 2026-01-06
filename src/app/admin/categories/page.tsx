'use client';

import React, { useState, useEffect } from 'react';
import { categories as initialCategories } from '@/data/products';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import styles from '../admin.module.scss';

interface Category {
  id: string;
  name: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    'admin-categories',
    initialCategories
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '' });

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
  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }

    // ID는 이름에서 자동 생성 (편집 시는 기존 ID 유지)
    const categoryId = editingCategory ? editingCategory.id : formData.name;

    // 중복 확인 (편집 시 자기 자신 제외)
    const isDuplicate = categories.some(
      (cat) => cat.id === categoryId && cat.id !== editingCategory?.id
    );

    if (isDuplicate) {
      alert('이미 존재하는 카테고리입니다.');
      return;
    }

    if (editingCategory) {
      // 수정
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { id: categoryId, name: formData.name } : cat
        )
      );
    } else {
      // 추가
      const newCategory: Category = {
        id: categoryId,
        name: formData.name,
      };
      setCategories([...categories, newCategory]);
    }

    closeModal();
  };

  // 카테고리 삭제
  const handleDelete = (category: Category) => {
    // 'all' 카테고리는 삭제 불가
    if (category.id === 'all') {
      alert('"전체" 카테고리는 삭제할 수 없습니다.');
      return;
    }

    // 해당 카테고리를 사용하는 제품이 있는지 확인
    const savedProducts = localStorage.getItem('admin-products');
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      const hasProducts = products.some((p: any) => p.category === category.id);

      if (hasProducts) {
        if (
          !confirm(
            `이 카테고리를 사용하는 제품이 있습니다. 정말 삭제하시겠습니까?\n(제품의 카테고리는 "기타"로 변경됩니다)`
          )
        ) {
          return;
        }

        // 해당 카테고리의 제품들을 "기타"로 변경
        const updatedProducts = products.map((p: any) =>
          p.category === category.id ? { ...p, category: '기타' } : p
        );
        localStorage.setItem('admin-products', JSON.stringify(updatedProducts));
        window.dispatchEvent(new Event('localStorageUpdated'));
      } else {
        if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
          return;
        }
      }
    }

    setCategories(categories.filter((cat) => cat.id !== category.id));
  };

  return (
    <div className={styles.managementPage}>
      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageInfo}>
          <h2 className={styles.sectionTitle}>카테고리 관리</h2>
          <p className={styles.pageDesc}>제품 카테고리를 관리할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          ➕ 새 카테고리 추가
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
              <button className={styles.saveBtn} onClick={handleSave}>
                {editingCategory ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
