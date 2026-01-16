'use client';

import React, { useState, useEffect } from 'react';
import { PromotionCard } from '@/data/promotions';
import { useImageUpload } from '@/hooks/useImageUpload';
import Modal from '@/components/admin/Modal';
import ImageUpload from '@/components/admin/ImageUpload';
import styles from '../admin.module.scss';

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<PromotionCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { uploadImage } = useImageUpload();

  const [formData, setFormData] = useState<Partial<PromotionCard>>({
    type: 'event',
    title: '',
    description: '',
    image: '',
    link: '#',
  });

  // API에서 프로모션 로드
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/promotions?all=true');
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('프로모션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 프로모션 목록
  const filteredPromotions = promotions.filter((promo) =>
    promo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 모달 열기
  const openModal = (promotion?: PromotionCard) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData(promotion);
    } else {
      setEditingPromotion(null);
      setFormData({
        type: 'event',
        title: '',
        description: '',
        image: '',
        link: '#',
      });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    setFormData({
      type: 'event',
      title: '',
      description: '',
      image: '',
      link: '#',
    });
  };

  // 프로모션 저장
  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      if (editingPromotion) {
        // 수정
        const response = await fetch(`/api/promotions/${editingPromotion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedPromotion = await response.json();
          setPromotions(promotions.map((p) => (p.id === editingPromotion.id ? updatedPromotion : p)));
          closeModal();
        } else {
          throw new Error('수정 실패');
        }
      } else {
        // 추가
        const response = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newPromotion = await response.json();
          setPromotions([newPromotion, ...promotions]);
          closeModal();
        } else {
          throw new Error('추가 실패');
        }
      }
    } catch (error) {
      console.error('프로모션 저장 실패:', error);
      alert('프로모션 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 프로모션 삭제
  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/promotions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setPromotions(promotions.filter((p) => p.id !== id));
        } else {
          throw new Error('삭제 실패');
        }
      } catch (error) {
        console.error('프로모션 삭제 실패:', error);
        alert('프로모션 삭제에 실패했습니다.');
      }
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
          <h2 className={styles.sectionTitle}>프로모션 관리</h2>
          <p className={styles.pageDesc}>이벤트와 프로모션을 관리할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          + 새 프로모션 추가
        </button>
      </div>

      {/* 검색 */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="프로모션 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 프로모션 그리드 */}
      <div className={styles.promoGrid}>
        {filteredPromotions.map((promotion) => (
          <div key={promotion.id} className={styles.promoCard}>
            <div className={styles.promoImage}>
              {promotion.image ? (
                <img src={promotion.image} alt={promotion.title} />
              ) : (
                <div className={styles.noImage}>이미지 없음</div>
              )}
            </div>

            <div className={styles.promoContent}>
              <h3 className={styles.promoTitle}>{promotion.title}</h3>
              <p className={styles.promoDesc}>{promotion.description}</p>
              {promotion.link && (
                <a href={promotion.link} className={styles.promoLink} target="_blank">
                  링크: {promotion.link}
                </a>
              )}
            </div>

            <div className={styles.promoActions}>
              <div className={styles.actionBtns}>
                <button className={styles.editBtn} onClick={() => openModal(promotion)}>
                  수정
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(promotion.id)}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className={styles.emptyState}>
          <p>프로모션이 없습니다.</p>
        </div>
      )}

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPromotion ? '프로모션 수정' : '새 프로모션 추가'}
        size="medium"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className={styles.formGroup}>
            <label>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="프로모션 제목"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              설명 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="프로모션 설명"
              rows={4}
              required
            />
          </div>

          <ImageUpload
            label="이미지"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            onUpload={uploadImage}
            placeholder="프로모션 이미지를 업로드하세요"
          />

          <div className={styles.formGroup}>
            <label>링크 URL</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? '저장 중...' : editingPromotion ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
