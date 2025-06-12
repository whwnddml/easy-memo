'use client';

import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useMemoStore } from './store/memoStore';
import LoginForm from './components/LoginForm';
import MemoForm from './components/MemoForm';
import MemoList from './components/MemoList';

export default function Home() {
  const { isAuthenticated, verifyToken, logout, user } = useAuthStore();
  const { fetchMemos, clearMemos } = useMemoStore();

  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
    };
    initAuth();
  }, [verifyToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemos();
    }
  }, [isAuthenticated, fetchMemos]);

  const handleLogout = () => {
    clearMemos();
    logout();
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <main className="container">
      <div className="header">
        <h1>EasyMemo</h1>
        <div className="user-info">
          <span>안녕하세요, {user?.email}님!</span>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            로그아웃
          </button>
        </div>
      </div>
      <MemoForm />
      <MemoList />
    </main>
  );
} 