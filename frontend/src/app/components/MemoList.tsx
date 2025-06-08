'use client'

import { useMemoStore } from '../store/memoStore'

export default function MemoList() {
  const { memos, deleteMemo } = useMemoStore()

  return (
    <div>
      {memos.map((memo) => (
        <div key={memo._id || memo.id} className="memo-item">
          <p>{memo.content}</p>
          <div className="memo-footer">
            <span>{new Date(memo.createdAt).toLocaleString('ko-KR')}</span>
            <button onClick={() => deleteMemo(memo._id || memo.id)}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
} 