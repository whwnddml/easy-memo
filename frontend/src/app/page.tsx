'use client';

/* HomeContent Componet */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from './store/authStore';
import { useMemoStore } from './store/memoStore';
import LoginForm from './components/LoginForm';
import MemoForm from './components/MemoForm';
import MemoList from './components/MemoList';
import Link from 'next/link';

function HomeContent() {
  const { isAuthenticated, verifyToken, logout, user } = useAuthStore();
  const { fetchMemos, clearMemos } = useMemoStore();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    } else {
      //router.push('/login'); // 로그인 상태가 아니면 로그인 페이지로 이동
      clearMemos();
    }
  }, [isAuthenticated, isGuestMode, fetchMemos, clearMemos]);

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

  const handleEnableGuestMode = () => {
    setIsGuestMode(true);
    window.history.replaceState({}, '', '/?mode=guest');
  };

  if (!isAuthenticated && !isGuestMode) {
    return (
      <div>
      <LoginForm />
    </div>
    );
  }

  //console.log('isAuthenticated:', isAuthenticated);
  //console.log('isGuestMode:', isGuestMode);

  return (
    <main className="container">
      <div className="header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
        <h1>EasyMemo</h1>
        <div className="user-info">
          {isAuthenticated ? (
            <>
              <span>안녕하세요, {user?.email}님!</span>
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <span>게스트 모드 (로컬 저장)</span>
              <div className="guest-actions">
                <button onClick={handleLoginMode} className="login-btn">
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