'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import MemoForm from '../components/MemoForm';
import MemoList from '../components/MemoList';

export default function MemosPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const isGuestMode = !isAuthenticated; // 게스트 모드 여부를 로그인 상태로 판단
  const router = useRouter();

  const handleLogout = () => {
    logout(); // 로그아웃 처리
    router.push('/login'); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <main className="container mx-auto p-4">
      <header className="mb-4">
        {isAuthenticated ? (
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">안녕하세요, {user?.email}님!</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">게스트 모드로 이용 중입니다.</h1>
            <p className="text-gray-600 mb-4">로그인하여 클라우드에 메모를 저장하세요.</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              로그인
            </button>
          </div>
        )}
      </header>
      <MemoForm />
      <MemoList />
    </main>
  );
}