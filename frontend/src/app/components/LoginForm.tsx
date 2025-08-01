'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) {
      return;
    }

    //await login(email.trim(), password);
    const success = await login(email, password);
    if (success) {
      // 로그인 상태 업데이트
      // 로그인 성공 후 사용자 상태 업데이트
      useAuthStore.getState().isAuthenticated = true;
      router.push('/memos'); // 로그인 성공 시 메모 목록 화면으로 이동
    }
  };

  const handleGuestMode = () => {
    // 게스트 모드로 메인 페이지 이동 (로그인 없이)
    router.push('/?mode=guest');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Easy Memo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            로그인하여 클라우드에 저장하거나 게스트로 이용하세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                패스워드
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="패스워드"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            
            <button
              type="button"
              onClick={handleGuestMode}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              게스트로 이용하기 (로컬 저장)
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={handleSignUp}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                회원가입
              </button>
            </p>
            <p className="text-xs text-gray-500">
              또는 회원가입 없이{' '}
              <button
                type="button"
                onClick={handleGuestMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 underline"
              >
                게스트 모드로 바로 시작
              </button>
            </p>
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={() => router.push('/password-reset-request')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                비밀번호 재설정
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 