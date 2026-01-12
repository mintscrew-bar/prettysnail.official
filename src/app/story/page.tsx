'use client';

import React from 'react';
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

          {/* 3-1. 우리의 양식장 */}
          <section className={styles.farmSection}>
            <div className={styles.farmIntro}>
              <h2 className={styles.largeText}>우리의 양식장</h2>
              <p className={styles.paragraph}>
                신선함의 시작은 양식장에서 비롯됩니다.
              </p>
            </div>

            <div className={styles.farmGrid}>
              <div className={styles.farmItem}>
                <div className={styles.farmImageWrapper}>
                  <img src="/images/story/양식장 사진 1.jpg" alt="청정 환경" />
                </div>
                <div className={styles.farmItemText}>
                  <h3>청정한 환경</h3>
                  <p>
                    자연 그대로의 청정 수질에서 우렁이를 양식합니다.
                    주변 환경의 오염원을 철저히 차단하고,
                    깨끗한 물만을 사용해 건강한 우렁이를 키웁니다.
                  </p>
                </div>
              </div>

              <div className={styles.farmItem}>
                <div className={styles.farmImageWrapper}>
                  <img src="/images/story/양식장 사진 2.jpg" alt="수질 관리" />
                </div>
                <div className={styles.farmItemText}>
                  <h3>체계적인 수질 관리</h3>
                  <p>
                    정기적인 수질 검사와 모니터링으로 최적의 양식 환경을 유지합니다.
                    온도, pH, 용존산소량 등을 철저히 관리하여
                    우렁이가 스트레스 없이 성장할 수 있도록 합니다.
                  </p>
                </div>
              </div>

              <div className={styles.farmItem}>
                <div className={styles.farmImageWrapper}>
                  <img src="/images/story/양식장 사진 3.png" alt="정성스러운 양식" />
                </div>
                <div className={styles.farmItemText}>
                  <h3>정성스러운 양식</h3>
                  <p>
                    수십 년간 축적된 양식 노하우와 정성으로
                    건강하고 품질 좋은 우렁이를 키웁니다.
                    매일 양식장을 점검하며 최상의 상태를 유지합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.farmClosing}>
              <p className={styles.paragraph}>
                우리의 양식장은 최고의 환경에서 최고의 제품을 만들기 위한 약속입니다.
                자연과 기술이 조화를 이루는 곳에서, 이쁜우렁이의 모든 제품이 탄생합니다.
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
                최종 손질이 완료된 제품은 냉장 배송으로 신선도를 유지하며,
                출고부터 배송까지 온도를 철저히 관리합니다.
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
              <h2 className={styles.closingTitle}>투명한 신뢰</h2>
              <p className={styles.closingParagraph}>
                무엇보다 우리는 생산부터 배송까지 모든 과정을 투명하게 공개합니다.
                고객님께서 무엇을 드시는지, 어떻게 만들어지는지 모두 알 권리가 있다고 믿기 때문입니다.
              </p>
              <p className={styles.closingParagraph}>
                이것이 이쁜우렁이가 걸어온 길이고, 앞으로도 걸어갈 길입니다.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.ctaSection}>
            <h2>이쁜우렁이와 함께하세요</h2>
            <p>건강하고 맛있는 우렁이 제품을 합리적인 가격으로 경험해보세요</p>
            <a href="/products" className={styles.ctaButton}>제품 둘러보기</a>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
