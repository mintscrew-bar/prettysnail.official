'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.scss';

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    // 유효성 검사
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.managementPage}>
      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageInfo}>
          <h2 className={styles.sectionTitle}>관리자 설정</h2>
          <p className={styles.pageDesc}>계정 설정을 관리할 수 있어요</p>
        </div>
      </div>

      {/* 비밀번호 변경 카드 */}
      <div className={styles.settingsCard} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>비밀번호 변경</h3>
          <p className={styles.cardDesc}>보안을 위해 주기적으로 비밀번호를 변경하세요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.settingsForm}>
          <div className={styles.formGroup}>
            <label>현재 비밀번호 *</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>새 비밀번호 *</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>새 비밀번호 확인 *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {/* 메시지 */}
          {message && (
            <div
              className={styles.alertMessage}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: 'var(--spacing-md)',
                backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        {/* 안내 사항 */}
        <div
          className={styles.infoBox}
          style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-bg-warm)',
            borderRadius: '10px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-light)',
          }}
        >
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            <strong>안내:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>비밀번호는 최소 6자 이상이어야 합니다</li>
            <li>비밀번호 변경 후 자동으로 로그아웃됩니다</li>
            <li>새 비밀번호로 다시 로그인해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
