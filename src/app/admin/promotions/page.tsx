'use client';

import React, { useState } from 'react';
import { promotions as initialPromotions, PromotionCard } from '@/data/promotions';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useImageUpload } from '@/hooks/useImageUpload';
import Modal from '@/components/admin/Modal';
import ImageUpload from '@/components/admin/ImageUpload';
import styles from '../admin.module.scss';

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useLocalStorage<PromotionCard[]>(
    'admin-promotions',
    initialPromotions
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { uploadImage } = useImageUpload();

  const [formData, setFormData] = useState<Partial<PromotionCard>>({
    title: '',
    description: '',
    image: '',
    link: '#',
  });

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
      title: '',
      description: '',
      image: '',
      link: '#',
    });
  };

  // 프로모션 저장
  const handleSave = () => {
    if (!formData.title || !formData.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (editingPromotion) {
      // 수정
      setPromotions(
        promotions.map((p) =>
          p.id === editingPromotion.id ? { ...formData, id: p.id } as PromotionCard : p
        )
      );
    } else {
      // 추가
      const newPromotion: PromotionCard = {
        ...formData,
        id: `promo-${Date.now()}`,
      } as PromotionCard;
      setPromotions([...promotions, newPromotion]);
    }

    closeModal();
  };

  // 프로모션 삭제
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  // 순서 변경
  const movePromotion = (index: number, direction: 'up' | 'down') => {
    const newPromotions = [...promotions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPromotions.length) return;

    [newPromotions[index], newPromotions[targetIndex]] = [
      newPromotions[targetIndex],
      newPromotions[index],
    ];
    setPromotions(newPromotions);
  };

  return (
    <div className={styles.managementPage}>
      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageInfo}>
          <h2 className={styles.sectionTitle}>프로모션 관리</h2>
          <p className={styles.pageDesc}>이벤트와 프로모션을 관리할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          ➕ 새 프로모션 추가
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
        {filteredPromotions.map((promotion, index) => (
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
              <div className={styles.orderBtns}>
                <button
                  className={styles.iconBtn}
                  onClick={() => movePromotion(index, 'up')}
                  disabled={index === 0}
                  title="위로 이동"
                >
                  ▲
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => movePromotion(index, 'down')}
                  disabled={index === filteredPromotions.length - 1}
                  title="아래로 이동"
                >
                  ▼
                </button>
              </div>

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
            <button type="submit" className={styles.saveBtn}>
              {editingPromotion ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
