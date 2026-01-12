'use client';

import React, { useState } from 'react';
import { products as initialProducts, Product, categories as initialCategories } from '@/data/products';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useImageUpload } from '@/hooks/useImageUpload';
import Modal from '@/components/admin/Modal';
import ImageUpload from '@/components/admin/ImageUpload';
import styles from '../admin.module.scss';

interface Category {
  id: string;
  name: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useLocalStorage<Product[]>('admin-products', initialProducts);
  const [categories, setCategories] = useLocalStorage<Category[]>('admin-categories', initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { uploadImage } = useImageUpload();

  // 기본 카테고리 (첫 번째 카테고리, 'all' 제외)
  const getDefaultCategory = () => {
    const firstCategory = categories.find((cat) => cat.id !== 'all');
    return firstCategory?.id || '';
  };

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: getDefaultCategory() as Product['category'],
    price: 0,
    description: '',
    tags: [],
    thumbnail: '',
    detailImages: [],
    stores: {},
  });

  // 상세 이미지 URL 배열
  const [detailImages, setDetailImages] = useState<string[]>([]);

  // 필터링된 제품 목록
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 모달 열기
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setDetailImages(product.detailImages || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: getDefaultCategory() as Product['category'],
        price: 0,
        description: '',
        tags: [],
        thumbnail: '',
        detailImages: [],
        stores: {},
      });
      setDetailImages([]);
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setDetailImages([]);
  };

  // 상세 이미지 추가
  const addDetailImage = async (file: File) => {
    try {
      const url = await uploadImage(file);
      setDetailImages([...detailImages, url]);
    } catch (error) {
      throw error;
    }
  };

  // 상세 이미지 삭제
  const removeDetailImage = (index: number) => {
    setDetailImages(detailImages.filter((_, i) => i !== index));
  };

  // 제품 저장
  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert('제목, 가격, 설명은 필수 항목입니다.');
      return;
    }

    try {
      const productData: Partial<Product> = {
        ...formData,
        detailImages: detailImages,
      };

      if (editingProduct) {
        // 수정
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? { ...productData, id: p.id } as Product : p))
        );
      } else {
        // 추가
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
        } as Product;
        setProducts([...products, newProduct]);
      }

      closeModal();
    } catch (error) {
      // 에러는 useLocalStorage에서 이미 처리됨
      console.error('제품 저장 실패:', error);
    }
  };

  // 제품 삭제
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // 태그 추가/제거
  const handleTagChange = (tag: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  // 스토어 링크 변경
  const handleStoreChange = (store: 'naver' | 'coupang' | 'etc', value: string) => {
    setFormData({
      ...formData,
      stores: {
        ...formData.stores,
        [store]: value || undefined,
      },
    });
  };

  return (
    <div className={styles.managementPage}>
      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageInfo}>
          <h2 className={styles.sectionTitle}>제품 관리</h2>
          <p className={styles.pageDesc}>제품을 추가, 수정, 삭제할 수 있어요</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>
          ➕ 새 제품 추가
        </button>
      </div>

      {/* 필터 & 검색 */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="제품명으로 검색..."
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
            {categories.slice(1).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 제품 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>썸네일</th>
              <th>제품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>스토어</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className={styles.thumbnail} />
                  ) : (
                    <div className={styles.noThumbnail}>없음</div>
                  )}
                </td>
                <td className={styles.productName}>{product.name}</td>
                <td>
                  <span className={styles.badge}>{product.category}</span>
                </td>
                <td className={styles.price}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                  <span className={styles.currentPrice}>{product.price.toLocaleString()}원</span>
                </td>
                <td>
                  <div className={styles.storeIcons}>
                    {product.stores?.naver && <span title="네이버">🟢</span>}
                    {product.stores?.coupang && <span title="쿠팡">🔴</span>}
                    {product.stores?.etc && <span title="기타">⚪</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} onClick={() => openModal(product)}>
                      수정
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <p>제품이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? '제품 수정' : '새 제품 추가'}
        size="large"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className={styles.modalBody}>
              {/* 기본 정보 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>기본 정보</h4>

                <div className={styles.formGroup}>
                  <label>제품명 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="제품명을 입력하세요"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>카테고리 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as Product['category'],
                        })
                      }
                    >
                      {categories
                        .filter((cat) => cat.id !== 'all')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>가격 *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>정가</label>
                    <input
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: Number(e.target.value) || undefined })
                      }
                      placeholder="할인 전 가격"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>설명 *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="제품 설명을 입력하세요"
                    rows={4}
                  />
                </div>
              </div>

              {/* 이미지 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>이미지</h4>

                <ImageUpload
                  label="썸네일 이미지"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  onUpload={uploadImage}
                  placeholder="제품 썸네일 이미지를 업로드하세요"
                />

                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <label>상세 페이지 이미지</label>

                  {/* 업로드된 이미지들 */}
                  {detailImages.length > 0 && (
                    <div className={styles.detailImagesPreview}>
                      {detailImages.map((url, index) => (
                        <div key={index} className={styles.detailImageItem}>
                          <img src={url} alt={`상세 이미지 ${index + 1}`} />
                          <button
                            type="button"
                            className={styles.imageRemoveBtn}
                            onClick={() => removeDetailImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 새 이미지 추가 */}
                  <ImageUpload
                    label=""
                    value=""
                    onChange={(url) => setDetailImages([...detailImages, url])}
                    onUpload={uploadImage}
                    placeholder="상세 페이지 이미지를 추가하세요"
                  />
                </div>
              </div>

              {/* 스토어 링크 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>판매 스토어</h4>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!formData.stores?.naver}
                      onChange={(e) =>
                        handleStoreChange('naver', e.target.checked ? 'https://smartstore.naver.com' : '')
                      }
                    />
                    네이버 스마트스토어
                  </label>
                  {formData.stores?.naver && (
                    <input
                      type="text"
                      value={formData.stores.naver}
                      onChange={(e) => handleStoreChange('naver', e.target.value)}
                      placeholder="네이버 스마트스토어 링크"
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!formData.stores?.coupang}
                      onChange={(e) =>
                        handleStoreChange('coupang', e.target.checked ? 'https://coupang.com' : '')
                      }
                    />
                    쿠팡
                  </label>
                  {formData.stores?.coupang && (
                    <input
                      type="text"
                      value={formData.stores.coupang}
                      onChange={(e) => handleStoreChange('coupang', e.target.value)}
                      placeholder="쿠팡 링크"
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!formData.stores?.etc}
                      onChange={(e) =>
                        handleStoreChange('etc', e.target.checked ? 'https://' : '')
                      }
                    />
                    기타 스토어
                  </label>
                  {formData.stores?.etc && (
                    <input
                      type="text"
                      value={formData.stores.etc}
                      onChange={(e) => handleStoreChange('etc', e.target.value)}
                      placeholder="기타 스토어 링크"
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </div>
              </div>

              {/* 추가 옵션 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>추가 옵션</h4>

                <div className={styles.formGroup}>
                  <label>태그</label>
                  <div className={styles.tagSelector}>
                    {['HACCP', '무항생제', '국내산', '신선', '친환경', '밀키트', '세트상품'].map(
                      (tag) => (
                        <label key={tag} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={formData.tags?.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                          />
                          {tag}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isBestSeller || false}
                        onChange={(e) =>
                          setFormData({ ...formData, isBestSeller: e.target.checked })
                        }
                      />
                      베스트셀러
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isNew || false}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      />
                      신제품
                    </label>
                  </div>
                </div>
              </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              {editingProduct ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
