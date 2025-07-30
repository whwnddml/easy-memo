'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';

export default function SignUpPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'social'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('이메일과 패스워드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('패스워드가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('패스워드는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 이메일 회원가입 API 호출
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('API URL이 설정되지 않았습니다.');
      }
        
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/?signup=success');
    } catch (error) {
      setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: 구글 소셜 로그인 구현
      setError('구글 로그인 기능은 준비 중입니다.');
    } catch (error) {
      setError('구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            로그인으로 돌아가기
          </button>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Easy Memo 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정을 만들어 어디서나 메모에 접근하세요
          </p>
        </div>

        {/* 탭 선택 */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaEnvelope className="inline mr-2" />
            이메일로 가입
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaGoogle className="inline mr-2" />
            소셜 로그인
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {activeTab === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSignUp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 주소
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  패스워드
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="최소 6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  패스워드 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="패스워드를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || !confirmPassword.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaLock className="mr-2" />
              {isLoading ? '가입 중...' : '이메일로 회원가입'}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                소셜 계정으로 간편하게 시작하세요
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="mr-3 text-red-500" />
              {isLoading ? '연결 중...' : 'Google로 계속하기'}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                소셜 로그인을 통해 가입하면{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  이용약관
                </a>
                {' '}및{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  개인정보처리방침
                </a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 