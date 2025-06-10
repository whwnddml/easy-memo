'use client'

import { useEffect, useState } from 'react'
import { useMemoStore } from '../store/memoStore'
import { FaEdit, FaTrash } from 'react-icons/fa'

// 모바일 환경 감지 함수
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
};

// 운영체제 이름/버전/플랫폼 추출 함수
function getOSInfo() {
  if (typeof window === 'undefined') return '';
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  let os = 'unknown';
  let osVersion = '';

  if (/android/i.test(userAgent)) {
    os = 'Android';
    const match = userAgent.match(/Android\s([0-9\.]+)/i);
    if (match) osVersion = match[1];
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
    const match = userAgent.match(/OS\s([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/windows nt/i.test(userAgent)) {
    os = 'Windows';
    const match = userAgent.match(/Windows NT ([0-9\.]+)/i);
    if (match) {
      const v = match[1];
      osVersion = {
        '10.0': '10',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
      }[v] || v;
    }
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'MacOS';
    const match = userAgent.match(/Mac OS X ([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  }
  return `${os}${osVersion ? ' ' + osVersion : ''} (${platform})`;
}

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
                              deleteMemo(memo._id || memo.id)
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
                              deleteMemo(memo._id || memo.id)
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
  )
} 