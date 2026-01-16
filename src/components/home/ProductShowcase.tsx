'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/app/page.module.scss';
import { Product, categories as initialCategories } from '@/data/products';

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories] = useState(initialCategories);
  const [isVisible, setIsVisible] = useState(false);
  const [animateFilter, setAnimateFilter] = useState(false);

  // API에서 제품 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?all=true');
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data);
        }
      } catch (error) {
        console.error('제품 로드 실패:', error);
      }
    };

    fetchProducts();
  }, []);

  // useMemo를 사용하여 파생 상태 계산 (React 권장 패턴)
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px',
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    // 필터 변경 시 애니메이션 트리거
    setAnimateFilter(true);
    setSelectedCategory(categoryId);

    // 애니메이션 완료 후 상태 리셋
    setTimeout(() => {
      setAnimateFilter(false);
    }, 400);
  };

  return (
    <section ref={sectionRef} id="products" className={styles.productSection}>
      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <h2 className={styles.productTitle}>우리의 제품</h2>
          <p className={styles.productSubtitle}>
            신선하고 건강한 먹거리를 전해드려요
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className={styles.categoryFilter}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`${styles.categoryBtn} ${
                selectedCategory === cat.id ? styles.active : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 제품 그리드 */}
        <div className={`${styles.productGrid} ${isVisible ? styles.visible : ''} ${animateFilter ? styles.filterAnimate : ''}`}>
          {filteredProducts.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.productCard}
              data-category={product.category}
            >
              <div className={styles.productImageArea}>
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    priority={false}
                  />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {product.isNew && <span className={styles.productBadge}>NEW</span>}
                {product.isBestSeller && (
                  <span className={`${styles.productBadge} ${styles.bestSeller}`}>
                    BEST
                  </span>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                {product.tags && (
                  <div className={styles.productTags}>
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className={styles.productTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.productPrice}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {product.price.toLocaleString()}원
                  </span>
                </div>
                <div className={styles.productBtn}>
                  구매하기
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 전체 제품 보기 */}
        <div className={styles.viewAllContainer}>
          <Link href="/products" className={styles.viewAllBtn}>
            전체 제품 보기
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
