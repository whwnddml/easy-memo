'use client'

import { useState } from 'react'
import { useMemoStore } from '../store/memoStore'

// 데스크톱 환경 감지
const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  
  // 1. User Agent 체크
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 2. 터치 지원 여부 체크
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 3. 화면 크기 체크 (768px 이하를 모바일로 간주)
  const isSmallScreen = window.innerWidth <= 768;
  
  // 데스크톱은 모바일이 아닌 경우로 정의
  return !isMobileUserAgent && !hasTouchSupport && !isSmallScreen;
}

export default function MemoForm() {
  const [content, setContent] = useState('')
  const { addMemo, isLoading } = useMemoStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo({
      content: content.trim()
    })
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDesktop() ? "메모를 입력하세요... (Ctrl+Enter로 저장)" : "메모를 입력하세요..."}
        disabled={isLoading}
        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
      />
      <button 
        type="submit" 
        disabled={!content.trim() || isLoading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </form>
  )
} 