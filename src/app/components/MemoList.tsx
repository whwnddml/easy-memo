'use client';

import { useState, useCallback, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useMemoStore } from '../store/memoStore';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
};

const getOSInfo = () => {
  if (typeof window === 'undefined') return 'unknown';
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'Windows';
  if (userAgent.includes('mac')) return 'macOS';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('android')) return 'Android';
  if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
  
  return 'unknown';
};

export default function MemoList() {
  const { memos, deleteMemo, updateMemo, fetchMemos, isLoading, isHydrated } = useMemoStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const initializeMemos = useCallback(async () => {
    if (typeof window !== 'undefined' && isHydrated) {
      await fetchMemos();
    }
  }, [fetchMemos, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      initializeMemos();
    }
  }, [initializeMemos, isHydrated]);

  const handleEdit = useCallback((memo: { _id?: string; id: string; content: string }) => {
    setEditingId(memo._id || memo.id);
    setEditContent(memo.content);
  }, []);

  const handleSave = useCallback(async (id: string) => {
    if (!isHydrated) return;
    await updateMemo(id, editContent);
    setEditingId(null);
    setEditContent('');
  }, [updateMemo, editContent, isHydrated]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditContent('');
  }, []);

  if (!isHydrated) {
    return <div className="loading">로딩 중...</div>;
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
                  <div className="memo-content">{memo.content}</div>
                  <div className="memo-date">
                    {new Date(memo.createdAt).toLocaleString('ko-KR')}
                    {memo.isOffline && <span className="offline-badge">오프라인</span>}
                  </div>
                  <div className="memo-actions">
                    {isMobile() ? (
                      <>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(memo)}
                          disabled={isLoading}
                          aria-label="수정"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                              deleteMemo(memo._id || memo.id);
                            }
                          }}
                          disabled={isLoading}
                          aria-label="삭제"
                        >
                          <FaTrash size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(memo)}
                          disabled={isLoading}
                        >
                          수정
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                              deleteMemo(memo._id || memo.id);
                            }
                          }}
                          disabled={isLoading}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
      <div className="collection-info">
        <small>
          <div>앱 타입: {typeof window !== 'undefined' && (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) ? 'PWA' : 'Web'}</div>
          <div>운영체제: {getOSInfo()}</div>
          <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : ''}</div>
        </small>
      </div>
    </div>
  );
} 