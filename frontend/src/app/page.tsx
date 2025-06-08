'use client';

import { useEffect } from 'react';
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { useMemoStore } from './store/memoStore'

export default function Home() {
  const { syncOfflineMemos, isLoading, error } = useMemoStore();

  useEffect(() => {
    // 온라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      syncOfflineMemos();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineMemos]);

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