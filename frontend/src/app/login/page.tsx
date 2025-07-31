'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 페이지 접근 시 항상 홈 화면으로 리다이렉트
    router.push('/'); // '/' 경로로 리다이렉트
  }, [router]);

  return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
}