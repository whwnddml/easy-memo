'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from './store/authStore';
import { useMemoStore } from './store/memoStore';
import LoginForm from './components/LoginForm';
import MemoForm from './components/MemoForm';
import MemoList from './components/MemoList';

function HomeContent() {
  const { isAuthenticated, verifyToken, logout, user } = useAuthStore();
  const { fetchMemos, clearMemos } = useMemoStore();
  const searchParams = useSearchParams();
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
    };
    initAuth();
  }, [verifyToken]);

  useEffect(() => {
    // URL 파라미터에서 게스트 모드 확인
    const mode = searchParams.get('mode');
    if (mode === 'guest') {
      setIsGuestMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated || isGuestMode) {
      fetchMemos();
    }
  }, [isAuthenticated, isGuestMode, fetchMemos]);

  const handleLogout = () => {
    clearMemos();
    logout();
    setIsGuestMode(false);
    // URL에서 게스트 모드 파라미터 제거
    window.history.replaceState({}, '', '/');
  };

  const handleLoginMode = () => {
    setIsGuestMode(false);
    window.history.replaceState({}, '', '/');
  };

  if (!isAuthenticated && !isGuestMode) {
    return <LoginForm />;
  }

  return (
    <main className="container">
      <div className="header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
        <h1>EasyMemo</h1>
        <div className="user-info">
          {isAuthenticated ? (
            <>
              <span>안녕하세요, {user?.email}님!</span>
              <button 
                onClick={handleLogout}
                className="logout-btn"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <span>게스트 모드 (로컬 저장)</span>
              <div className="guest-actions">
                <button 
                  onClick={handleLoginMode}
                  className="login-btn"
                >
                  로그인하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <MemoForm />
      <MemoList />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loading">로딩 중...</div>}>
      <HomeContent />
    </Suspense>
  );
} 