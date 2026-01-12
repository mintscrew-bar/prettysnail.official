import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 초기값 설정
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 값 업데이트 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // 커스텀 이벤트 발생 (같은 탭 내에서 변경 감지용)
        window.dispatchEvent(new Event('localStorageUpdated'));
      }
    } catch (error) {
      console.error(error);
      // QuotaExceededError 처리
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert(
          'localStorage 용량이 초과되었습니다.\n\n' +
          '해결 방법:\n' +
          '1. 더 작은 이미지를 사용하세요 (2MB 이하 권장)\n' +
          '2. 브라우저 개발자 도구(F12) > Application > Storage > Local Storage에서 데이터를 삭제하세요\n' +
          '3. Vercel에 배포하면 Blob Storage를 사용하여 이 문제가 해결됩니다'
        );
      }
      throw error;
    }
  };

  return [storedValue, setValue] as const;
}
