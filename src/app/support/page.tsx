'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './support.module.scss';
import { faqs, FAQ } from '@/data/qna';

export default function SupportPage() {
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // FAQ 카테고리 필터링
  const faqCategories = ['all', ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filteredFaqs =
    selectedFaqCategory === 'all'
      ? faqs
      : faqs.filter((f) => f.category === selectedFaqCategory);

  // FAQ 토글
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>고객지원</h1>
          <p className={styles.subtitle}>궁금하신 점이 있으시면 언제든 문의해주세요</p>
        </div>

        <div className={styles.content}>
          {/* 연락처 정보 */}
          <section className={styles.contactSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>문의하기</h2>
              <p className={styles.sectionDesc}>다양한 채널로 문의주시면 빠르게 답변드리겠습니다</p>
            </div>
            <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>✉️</div>
              <div>
                <h3>이메일 문의</h3>
                <p>contact@prettysnail.com</p>
              </div>
            </div>
            <a href="#" className={styles.contactItem}>
              <div className={styles.contactIcon}><img src="/icons/NStore_1.svg" alt="" /></div>
              <div>
                <h3>네이버 톡톡</h3>
                <p>이쁜우렁이 스마트스토어</p>
                <span>평일 09:00 - 16:00</span>
              </div>
            </a>
            </div>
          </section>

          {/* FAQ 섹션 */}
          <section className={styles.faqSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
              <p className={styles.sectionDesc}>고객님들이 자주 궁금해하시는 내용을 모았습니다</p>
            </div>

            <div className={styles.categoryFilter}>
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFaqCategory(cat)}
                  className={`${styles.categoryBtn} ${
                    selectedFaqCategory === cat ? styles.active : ''
                  }`}
                >
                  {cat === 'all' ? '전체' : cat}
                </button>
              ))}
            </div>

            <div className={styles.faqList}>
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`${styles.faqItem} ${
                    expandedFaq === faq.id ? styles.expanded : ''
                  }`}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className={styles.faqCategory}>{faq.category}</span>
                    <span className={styles.faqQuestionText}>Q. {faq.question}</span>
                    <span className={styles.faqToggle}>
                      {expandedFaq === faq.id ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className={styles.faqAnswer}>
                      <p>A. {faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
