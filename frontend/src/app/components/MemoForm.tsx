'use client'

import { useState } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const { addMemo } = useMemoStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
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
        style={{ color: '#333' }}
      />
      <button type="submit">저장</button>
    </form>
  )
} 