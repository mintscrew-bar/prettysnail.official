import type { Metadata, Viewport } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: {
    default: '이쁜우렁이 | 안심하고 먹는 즐거움',
    template: '%s | 이쁜우렁이',
  },
  description: 'HACCP 인증과 무항생제 사료로 키운 국내산 우렁이. 신선하고 건강한 먹거리를 전해드립니다.',
  keywords: ['우렁이', '국내산', 'HACCP', '무항생제', '건강식품', '이쁜우렁이', '우렁이 요리', '청정 우렁이'],
  authors: [{ name: '이쁜우렁이' }],
  creator: '이쁜우렁이',
  publisher: '이쁜우렁이',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://prettysnail.com',
    title: '이쁜우렁이 | 안심하고 먹는 즐거움',
    description: 'HACCP 인증과 무항생제 사료로 키운 국내산 우렁이',
    siteName: '이쁜우렁이',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '이쁜우렁이',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '이쁜우렁이 | 안심하고 먹는 즐거움',
    description: 'HACCP 인증과 무항생제 사료로 키운 국내산 우렁이',
    images: ['/og-image.jpg'],
  },
  verification: {
    // Google Search Console
    // google: 'your-google-site-verification',
    // Naver Search Advisor
    // other: {
    //   'naver-site-verification': 'your-naver-verification',
    // },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#5d7a4a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <style>{`
          @font-face {
            font-family: 'memomentKkukKkuk';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2508-2@1.0/memomentKkukKkuk.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
