'use client';

import { useEffect } from 'react';
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'
import { useMemoStore } from './store/memoStore'

export default function Home() {
  const { fetchMemos, syncOfflineMemos, isLoading, error } = useMemoStore();

  useEffect(() => {
    fetchMemos();

    // 온라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      syncOfflineMemos();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchMemos, syncOfflineMemos]);

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <main className="container">
      <h1>온라인 메모</h1>
      <MemoForm />
      <MemoList />
    </main>
  )
} 