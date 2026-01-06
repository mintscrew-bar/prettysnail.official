import type { Metadata, Viewport } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: '이쁜우렁이 | 안심하고 먹는 즐거움',
  description: 'HACCP 인증과 무항생제 사료, 국내산 우렁이',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
