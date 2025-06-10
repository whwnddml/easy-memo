'use client'

import { useEffect, useState } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoList() {
  const { memos, deleteMemo, updateMemo, fetchMemos, isLoading } = useMemoStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  const handleEdit = (memo: { _id?: string; id: string; content: string }) => {
    setEditingId(memo._id || memo.id)
    setEditContent(memo.content)
  }

  const handleSave = async (id: string) => {
    await updateMemo(id, editContent)
    setEditingId(null)
    setEditContent('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditContent('')
  }

  return (
    <div className="memo-list-container">
      <div className={`loading-overlay ${isLoading ? 'visible' : ''}`}>
        <div className="loading-spinner" />
      </div>
      
      <div className="memo-list">
        {memos.length === 0 && !isLoading ? (
          <div className="memo-empty">
            <p>작성된 메모가 없습니다.</p>
          </div>
        ) : (
          memos.map((memo) => (
            <div key={memo._id || memo.id} className="memo-item">
              {editingId === (memo._id || memo.id) ? (
                <div className="memo-edit">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-buttons">
                    <button 
                      className="save-btn"
                      onClick={() => handleSave(memo._id || memo.id)}
                      disabled={!editContent.trim() || isLoading}
                    >
                      저장
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{memo.content}</p>
                  <div className="memo-footer">
                    <span className="timestamp">
                      {new Date(memo.createdAt).toLocaleString('ko-KR')}
                      {memo.isOffline && <span className="offline-badge">오프라인</span>}
                    </span>
                    <div className="memo-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(memo)}
                        disabled={isLoading}
                      >
                        수정
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteMemo(memo._id || memo.id)}
                        disabled={isLoading}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 