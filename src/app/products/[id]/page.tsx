'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product, products as initialProducts } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '../products.module.scss';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = () => {
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem('admin-products');
        let allProducts: Product[] = [];

        if (savedProducts) {
          allProducts = JSON.parse(savedProducts);
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-products', JSON.stringify(initialProducts));
          allProducts = initialProducts;
        }

        const currentProduct = allProducts.find((p) => p.id === params.id);

        if (currentProduct) {
          setProduct(currentProduct);

          // 같은 카테고리의 다른 제품 추천
          const related = allProducts
            .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 3);
          setRelatedProducts(related);
        }
      }
    };

    loadProduct();

    // storage 이벤트 리스너 (다른 탭에서 변경 시 감지)
    window.addEventListener('storage', loadProduct);

    // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
    const handleStorageChange = () => loadProduct();
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', loadProduct);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, [params.id]);

  if (!product) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>제품을 불러오는 중...</p>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const totalPrice = product.price * quantity;

  // 스토어 버튼 정보
  const storeButtons = [
    {
      key: 'naver',
      url: product.stores?.naver,
      label: '네이버 스마트스토어에서 구매',
      className: styles.buyBtn,
    },
    {
      key: 'coupang',
      url: product.stores?.coupang,
      label: '쿠팡에서 구매',
      className: styles.coupangBtn,
    },
    {
      key: 'etc',
      url: product.stores?.etc,
      label: '구매하기',
      className: styles.etcBtn,
    },
  ].filter((store) => store.url); // URL이 있는 스토어만 필터링

  return (
    <>
      <Header />
      <div className={styles.productDetail}>
        {/* 네비게이션 */}
        <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/products">제품</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* 제품 상단 정보 */}
      <div className={styles.detailSection}>
        <div className={styles.container}>
          <div className={styles.detailGrid}>
            {/* 썸네일 이미지 */}
            <div className={styles.detailImage}>
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                />
              ) : (
                <div className={styles.noImage}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* 뱃지 */}
              <div className={styles.badges}>
                {product.isNew && <span className={styles.badgeNew}>NEW</span>}
                {product.isBestSeller && <span className={styles.badgeBest}>BEST</span>}
              </div>
            </div>

            {/* 정보 */}
            <div className={styles.detailInfo}>
              <div className={styles.category}>{product.category}</div>
              <h1 className={styles.detailTitle}>{product.name}</h1>

              {/* 태그 */}
              {product.tags && product.tags.length > 0 && (
                <div className={styles.tags}>
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className={styles.detailDesc}>{product.description}</p>

              {/* 가격 */}
              <div className={styles.priceSection}>
                {product.originalPrice && (
                  <>
                    <div className={styles.originalPrice}>
                      정가: {product.originalPrice.toLocaleString()}원
                    </div>
                    <div className={styles.discount}>
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인
                    </div>
                  </>
                )}
                <div className={styles.currentPrice}>
                  {product.price.toLocaleString()}원
                </div>
              </div>

              {/* 수량 선택 */}
              <div className={styles.quantitySection}>
                <label>수량</label>
                <div className={styles.quantityControl}>
                  <button onClick={() => handleQuantityChange(-1)}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button onClick={() => handleQuantityChange(1)}>+</button>
                </div>
              </div>

              {/* 총 금액 */}
              <div className={styles.totalPrice}>
                <span>총 금액</span>
                <span className={styles.totalAmount}>{totalPrice.toLocaleString()}원</span>
              </div>

              {/* 구매 버튼 - 동적으로 표시 */}
              {storeButtons.length > 0 && (
                <div className={styles.actionButtons}>
                  {storeButtons.map((store) => (
                    <a
                      key={store.key}
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={store.className}
                    >
                      {store.label}
                    </a>
                  ))}
                </div>
              )}

              {/* 추가 정보 */}
              <div className={styles.additionalInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🚚</span>
                  <span>전국 배송 가능</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>❄️</span>
                  <span>신선 냉동 배송</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>✅</span>
                  <span>HACCP 인증</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 이미지 섹션 */}
      {product.detailImages && product.detailImages.length > 0 && (
        <div className={styles.detailImagesSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>상세 정보</h2>
            <div className={styles.detailImagesGrid}>
              {product.detailImages.map((imageUrl, index) => (
                <div key={index} className={styles.detailImageItem}>
                  <img
                    src={imageUrl}
                    alt={`${product.name} 상세 이미지 ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 관련 제품 */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>같은 카테고리 제품</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {relatedProduct.thumbnail ? (
                      <img
                        src={relatedProduct.thumbnail}
                        alt={relatedProduct.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3>{relatedProduct.name}</h3>
                    <div className={styles.relatedPrice}>
                      {relatedProduct.price.toLocaleString()}원
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
  </>
  );
}
