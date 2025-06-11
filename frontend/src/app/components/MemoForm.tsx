'use client'

import { useState, useEffect } from 'react'
import { useMemoStore, getUserId } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const { addMemo } = useMemoStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo({
      content,
      userId: getUserId(),
      createdAt: new Date().toISOString()
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
        placeholder="메모를 입력하세요..."
      />
      <button type="submit" disabled={!content.trim()}>
        저장
      </button>
    </form>
  )
} 