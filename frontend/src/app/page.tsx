'use client';

import { useEffect } from 'react';
import { useMemoStore } from './store/memoStore'
import MemoForm from './components/MemoForm'
import MemoList from './components/MemoList'

export default function Home() {
  const { fetchMemos } = useMemoStore();

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  return (
    <main className="container">
      <h1>EasyMemo</h1>
      <MemoForm />
      <MemoList />
    </main>
  )
} 