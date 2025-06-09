'use client'

import { useState } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const { addMemo, isOnline } = useMemoStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo(content)
    setContent('')
  }

  // 수집 정보 표시 (개발용)
  const showCollectionInfo = true // 나중에 false로 변경하여 쉽게 제거 가능

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="메모를 입력하세요..."
        disabled={!isOnline}
      />
      <button type="submit" disabled={!content.trim() || !isOnline}>
        저장
      </button>
      {showCollectionInfo && (
        <div className="collection-info">
          <small>
            수집 정보: 앱 타입, 운영체제, 사용자 에이전트
          </small>
        </div>
      )}
    </form>
  )
} 