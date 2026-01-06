'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.scss';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  // 로그인 시도 횟수 및 차단 상태 복구
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 로그인 시도 횟수 및 차단 상태 복구
      const attempts = parseInt(localStorage.getItem('login-attempts') || '0');
      const blocked = parseInt(localStorage.getItem('login-blocked-until') || '0');

      setLoginAttempts(attempts);

      if (blocked > Date.now()) {
        setBlockedUntil(blocked);
      } else {
        // 차단 시간이 지났으면 초기화
        localStorage.removeItem('login-attempts');
        localStorage.removeItem('login-blocked-until');
      }
    }
  }, []);

  // 차단 시간 카운트다운
  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, blockedUntil - Date.now());
      setRemainingTime(remaining);

      if (remaining === 0) {
        setBlockedUntil(null);
        setLoginAttempts(0);
        localStorage.removeItem('login-attempts');
        localStorage.removeItem('login-blocked-until');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 차단 상태 확인 (로컬)
    if (blockedUntil && blockedUntil > Date.now()) {
      const minutes = Math.ceil(remainingTime / 60000);
      setError(`로그인이 차단되었습니다. ${minutes}분 후에 다시 시도해주세요.`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공
        localStorage.removeItem('login-attempts');
        localStorage.removeItem('login-blocked-until');
        router.push('/admin');
      } else {
        // 로그인 실패
        if (response.status === 429) {
          // 서버에서 차단됨
          const blockTime = Date.now() + (data.blockedMinutes || 15) * 60 * 1000;
          setBlockedUntil(blockTime);
          localStorage.setItem('login-blocked-until', blockTime.toString());
          setLoginAttempts(5);
          localStorage.setItem('login-attempts', '5');
        } else if (data.remainingAttempts !== undefined) {
          // 실패 횟수 업데이트
          const attempts = 5 - data.remainingAttempts;
          setLoginAttempts(attempts);
          localStorage.setItem('login-attempts', attempts.toString());
        }

        setError(data.error || '로그인에 실패했습니다.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* 로고 */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>🐌</div>
          <h1 className={styles.logoText}>이쁜우렁이</h1>
        </Link>

        {/* 로그인 카드 */}
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>관리자 로그인</h2>
            <p className={styles.subtitle}>관리자 계정으로 로그인하세요</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {/* 아이디 */}
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                아이디
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={styles.input}
                placeholder="관리자 아이디를 입력하세요"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={styles.input}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className={styles.errorMessage}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className={styles.loginBtn}
              disabled={isLoading || (blockedUntil !== null && blockedUntil > Date.now())}
            >
              {isLoading ? '로그인 중...' : blockedUntil && blockedUntil > Date.now() ? `차단됨 (${Math.ceil(remainingTime / 60000)}분)` : '로그인'}
            </button>
          </form>

          {/* 도움말 */}
          <div className={styles.helpText}>
            {loginAttempts > 0 && loginAttempts < 5 && (
              <p style={{ color: '#d97706' }}>남은 시도 횟수: {5 - loginAttempts}회</p>
            )}
          </div>
        </div>

        {/* 사이트로 돌아가기 */}
        <Link href="/" className={styles.backLink}>
          ← 사이트로 돌아가기
        </Link>
      </div>
    </div>
  );
}
