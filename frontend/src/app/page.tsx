'use client';

import { useEffect } from 'react';
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { useMemoStore } from './store/memoStore'

export default function Home() {
  const { setOnlineStatus, checkOnlineStatus, error } = useMemoStore();

  useEffect(() => {
    // 초기 온라인 상태 체크
    const checkInitialOnlineStatus = () => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setOnlineStatus(isOnline);
      checkOnlineStatus();
    };

    checkInitialOnlineStatus();

    // 주기적으로 온라인 상태 체크 (30초마다)
    const intervalId = setInterval(() => {
      checkOnlineStatus();
    }, 30000);

    // 온라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      setOnlineStatus(true);
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [setOnlineStatus, checkOnlineStatus]);

  return (
    <main className="container">
      <h1>EasyMemo</h1>
      {error && <div className="error">{error}</div>}
      <div className="content-area">
        <div className="memo-form-container">
          <MemoForm />
        </div>
        <MemoList />
      </div>
    </main>
  )
} 