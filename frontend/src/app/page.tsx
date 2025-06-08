'use client';

import { useEffect } from 'react';
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { useMemoStore } from './store/memoStore'

export default function Home() {
  const { setOnlineStatus, checkOnlineStatus, isLoading, error } = useMemoStore();

  useEffect(() => {
    // 초기 온라인 상태 체크
    checkOnlineStatus();

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

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, checkOnlineStatus]);

  return (
    <main className="container">
      <h1>EasyMemo</h1>
      {isLoading && <div className="loading">로딩 중...</div>}
      {error && <div className="error">{error}</div>}
      <MemoForm />
      <MemoList />
    </main>
  )
} 