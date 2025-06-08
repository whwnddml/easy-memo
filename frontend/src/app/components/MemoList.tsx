'use client'

import { useEffect } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoList() {
  const { memos, deleteMemo, fetchMemos, isLoading } = useMemoStore()

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  return (
    <div className={`memo-list ${isLoading ? 'loading' : ''}`}>
      {memos.length === 0 && !isLoading ? (
        <div className="memo-empty">
          <p>작성된 메모가 없습니다.</p>
        </div>
      ) : (
        memos.map((memo) => (
          <div key={memo._id || memo.id} className="memo-item">
            <p>{memo.content}</p>
            <div className="memo-footer">
              <span className="timestamp">
                {new Date(memo.createdAt).toLocaleString('ko-KR')}
                {memo.isOffline && <span className="offline-badge">오프라인</span>}
              </span>
              <button 
                className="delete-btn" 
                onClick={() => deleteMemo(memo._id || memo.id)}
                disabled={isLoading}
              >
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
} 