'use client'

import { useState } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const { addMemo, isLoading } = useMemoStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !isLoading) {
      await addMemo(content)
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="메모를 입력하세요..."
      />
      <div className="button-row">
        <button type="submit" disabled={isLoading || !content.trim()}>
          저장
        </button>
      </div>
    </form>
  )
} 