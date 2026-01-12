'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export default function Modal({ isOpen, onClose, title, children, size = 'medium' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Body 스크롤 락
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 애니메이션
  useEffect(() => {
    if (!overlayRef.current || !modalRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // 모달 열기
        const tl = gsap.timeline();

        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' }
        );

        tl.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.2)' },
          0.1
        );
      } else {
        // 모달 닫기
        const tl = gsap.timeline();

        tl.to(modalRef.current, {
          opacity: 0,
          scale: 0.9,
          y: 10,
          duration: 0.2,
          ease: 'power2.in',
        });

        tl.to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.15,
            ease: 'power2.in',
          },
          0.1
        );
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} ref={overlayRef} onClick={onClose}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="모달 닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
