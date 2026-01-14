'use client';

import React from 'react';
import styles from './ImageUpload.module.scss';
import { compressImage } from '@/utils/imageCompression';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  uploading?: boolean;
  placeholder?: string;
  required?: boolean;
  highQuality?: boolean; // 상세 이미지용 고품질 압축
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
  uploading = false,
  placeholder = '이미지를 업로드하세요',
  required = false,
  highQuality = false,
}: ImageUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 이미지 압축 (1MB 이상일 경우)
      let fileToUpload = file;
      if (file.size > 1 * 1024 * 1024) {
        console.log('이미지 압축 시작...');

        if (highQuality) {
          // 상세 이미지: 더 크고 높은 품질
          fileToUpload = await compressImage(file, 3000, 3000, 0.92);
        } else {
          // 썸네일: 적당한 크기와 품질
          fileToUpload = await compressImage(file, 1600, 1600, 0.88);
        }
      }

      const url = await onUpload(fileToUpload);
      onChange(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={styles.imageUpload}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {value ? (
        <div className={styles.preview}>
          <img src={value} alt="미리보기" className={styles.previewImage} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label="이미지 삭제"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className={styles.fileInput}
          />
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <span>업로드 중...</span>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{placeholder}</span>
              <span className={styles.hint}>클릭하거나 파일을 드래그하세요</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
