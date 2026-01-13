'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import MainBanner from '@/components/home/MainBanner';
import HookSection from '@/components/home/HookSection';
import StorytellingSection from '@/components/home/StorytellingSection';
import ProductShowcase from '@/components/home/ProductShowcase';
import OutroSection from '@/components/home/OutroSection';

export default function Homepage() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    document.body.classList.remove('loading');
  };

  useEffect(() => {
    // 페이지 로드 시 스크롤을 최상단으로
    window.scrollTo(0, 0);
    document.body.classList.add('loading');

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <Header />
      <main>
        <MainBanner />
        <HookSection />
        <ProductShowcase />
        <StorytellingSection />
        <OutroSection />
      </main>
      <Footer />
    </>
  );
}
