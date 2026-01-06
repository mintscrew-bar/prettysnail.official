'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, categories as initialCategories, products as initialProducts } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './products.module.scss';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // localStorage에서 제품 데이터 로드 및 초기화
  useEffect(() => {
    const loadProducts = () => {
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem('admin-products');
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-products', JSON.stringify(initialProducts));
          setProducts(initialProducts);
        }
      }
    };

    const loadCategories = () => {
      if (typeof window !== 'undefined') {
        const savedCategories = localStorage.getItem('admin-categories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // localStorage가 비어있으면 정적 데이터로 초기화
          localStorage.setItem('admin-categories', JSON.stringify(initialCategories));
          setCategories(initialCategories);
        }
      }
    };

    loadProducts();
    loadCategories();

    // storage 이벤트 리스너 (다른 탭에서 변경 시 감지)
    const handleStorage = () => {
      loadProducts();
      loadCategories();
    };
    window.addEventListener('storage', handleStorage);

    // 같은 탭에서의 변경을 감지하기 위한 커스텀 이벤트
    const handleStorageChange = () => {
      loadProducts();
      loadCategories();
    };
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  // 필터링 & 정렬
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
        default:
          return Number(b.id) - Number(a.id);
      }
    });

  return (
    <>
      <Header />
      <div className={styles.productsPage}>
        {/* 헤더 */}
        <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backBtn}>
            ← 홈으로
          </Link>
          <h1 className={styles.pageTitle}>전체 제품</h1>
          <p className={styles.pageSubtitle}>
            신선하고 건강한 우리의 제품을 만나보세요
          </p>
        </div>
      </header>

      {/* 필터 & 검색 */}
      <div className={styles.filterSection}>
        <div className={styles.container}>
          {/* 검색 */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="제품명 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* 필터 & 정렬 */}
          <div className={styles.filterControls}>
            {/* 카테고리 필터 */}
            <div className={styles.categoryTabs}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`${styles.categoryTab} ${
                    selectedCategory === cat.id ? styles.active : ''
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <div className={styles.sortBox}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={styles.sortSelect}
              >
                <option value="newest">최신순</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
              </select>
            </div>
          </div>

          {/* 결과 카운트 */}
          <div className={styles.resultCount}>
            {filteredProducts.length}개의 제품
          </div>
        </div>
      </div>

      {/* 제품 그리드 */}
      <div className={styles.container}>
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.productCard}
            >
              {/* 뱃지 */}
              <div className={styles.badges}>
                {product.isNew && <span className={styles.badgeNew}>NEW</span>}
                {product.isBestSeller && <span className={styles.badgeBest}>BEST</span>}
                {product.originalPrice && (
                  <span className={styles.badgeSale}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% SALE
                  </span>
                )}
              </div>

              {/* 이미지 */}
              <div className={styles.productImage}>
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} />
                ) : (
                  <div className={styles.noImage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className={styles.productInfo}>
                <div className={styles.category}>{product.category}</div>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>

                {/* 태그 */}
                {product.tags && product.tags.length > 0 && (
                  <div className={styles.tags}>
                    {product.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 가격 */}
                <div className={styles.priceBox}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                  <span className={styles.price}>{product.price.toLocaleString()}원</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>제품이 없습니다</h3>
            <p>검색 조건을 변경하거나 다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>
  );
}
