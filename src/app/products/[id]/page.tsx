'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '../products.module.scss';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);

        // 제품 상세 정보 로드
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const currentProduct = await response.json();
          setProduct(currentProduct);

          // 관련 제품 로드
          const allResponse = await fetch('/api/products?all=true');
          if (allResponse.ok) {
            const allProducts = await allResponse.json();
            const related = allProducts
              .filter((p: Product) => p.category === currentProduct.category && p.id !== currentProduct.id)
              .slice(0, 3);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error('제품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  if (isLoading || !product) {
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
            {/* 썸네일 갤러리 */}
            <div className={styles.detailImage}>
              {/* 이미지가 있는 경우 */}
              {((product.thumbnails && product.thumbnails.length > 0) || product.thumbnail) ? (
                <div className={styles.swiperContainer}>
                  {/* 메인 스와이퍼 */}
                  <Swiper
                    modules={[Navigation, Thumbs]}
                    navigation
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    className={styles.mainSwiper}
                    spaceBetween={10}
                    slidesPerView={1}
                  >
                    {(product.thumbnails && product.thumbnails.length > 0 ? product.thumbnails : [product.thumbnail!]).map((imageUrl, index) => (
                      <SwiperSlide key={index}>
                        <div className={styles.slideImageWrapper}>
                          <img
                            src={imageUrl}
                            alt={`${product.name} ${index + 1}`}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* 썸네일 네비게이션 (이미지가 2개 이상일 때만 표시) */}
                  {product.thumbnails && product.thumbnails.length > 1 && (
                    <Swiper
                      modules={[FreeMode, Thumbs]}
                      onSwiper={setThumbsSwiper}
                      freeMode
                      watchSlidesProgress
                      slidesPerView="auto"
                      spaceBetween={10}
                      className={styles.thumbSwiper}
                    >
                      {product.thumbnails.map((imageUrl, index) => (
                        <SwiperSlide key={index} className={styles.thumbSlide}>
                          <div className={styles.thumbImageWrapper}>
                            <img
                              src={imageUrl}
                              alt={`${product.name} 썸네일 ${index + 1}`}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              ) : (
                /* 이미지가 없는 경우 */
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
                  <span className={styles.infoBullet}>•</span>
                  <span>전국 배송 가능</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoBullet}>•</span>
                  <span>신선 냉동 배송</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoBullet}>•</span>
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
