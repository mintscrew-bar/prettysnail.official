import { useState } from 'react';
import { upload } from '@vercel/blob/client';

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string>;
  uploading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024; // 4MB

      // Large file: Use client-side direct upload
      if (file.size >= LARGE_FILE_THRESHOLD) {
        console.log(
          '클라이언트 직접 업로드 사용 (대용량 파일):',
          (file.size / 1024 / 1024).toFixed(2) + 'MB'
        );

        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload/client',
        });

        return blob.url;
      }

      // Small file: Use existing server upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업로드 실패');
      }

      const data = await response.json();

      // 개발 모드 경고 표시
      if (data.warning) {
        console.warn(data.warning);
      }

      return data.url;
    } catch (err) {
      // Enhanced error messages
      let errorMessage = '업로드 중 오류가 발생했습니다.';

      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('token') || err.message.includes('토큰')) {
          errorMessage = '업로드 권한이 만료되었습니다. 다시 시도해주세요.';
        } else if (err.message.includes('size') || err.message.includes('크기')) {
          errorMessage = '파일 크기가 너무 큽니다 (최대 10MB).';
        } else if (err.message.includes('type') || err.message.includes('형식')) {
          errorMessage = '이미지 파일만 업로드 가능합니다.';
        } else if (err.message.includes('개발 모드')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
