'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../config/api'; // API 경로 상수 가져오기

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 
  const [buttonText, setButtonText] = useState('요청'); // 버튼 텍스트 상태 추가


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);
    setButtonText('요청 중...');

    if (!email.includes('@')) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '비밀번호 재설정 요청에 실패했습니다.');
      }

      setMessage('비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인하세요.');
      
      setButtonText('요청 완료'); // 요청 성공 시 버튼 텍스트 변경
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setButtonText('요청'); // 요청 실패 시 버튼 텍스트 복원
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          비밀번호 재설정 요청
        </h2>
       
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="이메일 입력"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-label="비밀번호 재설정 요청"
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {buttonText}
          </button>
        </form>
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default PasswordResetRequest;