'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './story.module.scss';

export default function StoryPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 1. 오프닝 */}
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>좋은 제품은<br />왜 항상 비싸야만<br />할까요?</h1>
          </section>

          {/* 2. 문제 제기 */}
          <section className={styles.storySection}>
            <div className={styles.splitLayout}>
              <div className={styles.textColumn}>
                <p className={styles.largeText}>
                  우리는 이 의문에서<br />시작했습니다.
                </p>
                <p className={styles.paragraph}>
                  신선하고 품질 좋은 우렁이를 합리적인 가격에 제공할 수 없을까?
                  시장을 살펴보니 불필요한 중간 유통 단계를 거치면서 가격은 계속 올라가고,
                  정작 소비자는 비싼 값을 치르고 있었습니다.
                </p>
              </div>
              <div className={styles.imageColumn}>
                <div className={styles.smallImage}>
                  <img src="/images/story/원물.jpg" alt="원물" />
                </div>
              </div>
            </div>
          </section>

          {/* 3. 해결책 - 큰 이미지 배경 */}
          <section className={styles.fullImageSection}>
            <img src="/images/story/탈각 전.jpg" alt="탈각 전" />
            <div className={styles.overlayContent}>
              <p className={styles.overlayText}>
                해결책은 생각보다 단순했습니다.<br />
                양식장에서 바로 고객님께 배송하면 되는 것이었죠.
              </p>
              <p className={styles.overlayText}>
                복잡한 유통 구조를 과감히 단순화하고,<br />
                생산자와 소비자를 직접 연결했습니다.
              </p>
            </div>
          </section>

          {/* 4. 공정 과정 */}
          <section className={styles.processSection}>
            <h2 className={styles.processHeading}>우리의 품질 관리</h2>

            <div className={styles.magazineGrid}>
              <div className={styles.gridItem}>
                <img src="/images/story/원물.jpg" alt="공정" />
              </div>

              <div className={styles.gridItem}>
                <img src="/images/story/탈각 및 이물질 제거 후.jpg" alt="공정" />
              </div>

              <div className={styles.gridItem}>
                <img src="/images/story/멸균 공정 후.jpg" alt="공정" />
              </div>

              <div className={styles.gridItem}>
                <img src="/images/story/손질 완료.jpg" alt="공정" />
              </div>
            </div>

            <div className={styles.processDescription}>
              <p className={styles.descText}>
                가격을 낮춘다고 해서 품질을 포기할 수는 없었습니다.
                오히려 더 엄격하게 관리해야 한다고 생각했습니다.
              </p>
              <p className={styles.descText}>
                양식장의 수질 관리부터 시작해 신선한 우렁이만 선별하여 수확하고, 깨끗하게 세척합니다.
                탈각과 이물질 제거 과정을 거친 후, 멸균 공정으로 위생을 보장합니다.
              </p>
              <p className={styles.descText}>
                정기적인 미생물 검사와 중금속 검사를 실시하고,
                포장 전 육안 검수를 통해 불량품을 걸러냅니다.
                최종 손질이 완료된 제품은 자동화 포장 공정을 거친 후 출고부터 배송까지 
                불필요한 중간 마진을 최소화하여 합리적인 가격으로 고객님께 전달됩니다.
              </p>
            </div>

            <div className={styles.haccpBanner}>
              <span className={styles.bannerIcon}>✓</span>
              <span className={styles.bannerText}>HACCP 식품안전관리 인증</span>
            </div>
          </section>

          {/* 5. 결론 */}
          <section className={styles.closingSection}>
            <div className={styles.closingText}>
              <h2 className={styles.closingTitle}>답은 언제나 정직함에 있었습니다</h2>
              <p className={styles.closingParagraph}>
                &ldquo;어떻게 이 가격에 이런 품질이 가능하죠?&rdquo;<br />
                  우리가 가장 기분 좋게 듣는 질문입니다.
              </p>
              <p className={styles.closingParagraph}>
                복잡한 계산 대신 투명한 과정을 택했기에 가능했던 일입니다.<br />
                이쁜우렁이는 앞으로도 가장 상식적인 답을 식탁 위로 전하겠습니다.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.ctaSection}>
            <h2>이쁜우렁이와 함께하세요</h2>
            <p>건강하고 맛있는 우렁이 제품을 합리적인 가격으로 경험해보세요</p>
            <Link href="/products" className={styles.ctaButton}>제품 둘러보기</Link>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
