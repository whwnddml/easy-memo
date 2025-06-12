'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useMemoStore } from '../store/memoStore'
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSync } from 'react-icons/fa'

// iOS 환경 감지
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// 모바일 환경 감지 함수
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
};

// 운영체제 이름/버전/플랫폼 추출 함수
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

// 시스템 정보 타입 정의
interface SystemInfo {
  appType: string
  os: string
  osVersion: string
  browser: string
  browserVersion: string
  deviceModel: string
  userAgent: string
}

export default function MemoList() {
  const { 
    memos, 
    deleteMemo, 
    updateMemo, 
    fetchMemos, 
    loadMoreMemos,
    isLoading, 
    isLoadingMore,
    hasMore 
  } = useMemoStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    appType: '',
    os: '',
    osVersion: '',
    browser: '',
    browserVersion: '',
    deviceModel: '',
    userAgent: ''
  })

  const initializeMemos = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await fetchMemos()
    }
  }, [fetchMemos])



  useEffect(() => {
    initializeMemos()
  }, [initializeMemos])

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isLoadingMore || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreMemos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreMemos, isLoading, isLoadingMore, hasMore])

  useEffect(() => {
    const collectSystemInfo = () => {
      // 앱 타입 감지
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone || 
                   document.referrer.includes('android-app://')

      // User-Agent 파싱
      const userAgent = navigator.userAgent
      const userAgentLower = userAgent.toLowerCase()
      
      // 운영체제 및 버전 감지
      let os = 'unknown'
      let osVersion = 'unknown'
      let deviceModel = 'unknown'
      
      if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
        os = 'iOS'
        const match = userAgent.match(/OS\s([0-9_]*)/)
        if (match) osVersion = match[1].replace(/_/g, '.')
        
        // iOS 기기 모델명 추출
        if (userAgentLower.includes('iphone')) {
          deviceModel = 'iPhone'
          // iPhone 모델 상세 정보 추출 시도
          const modelMatch = userAgent.match(/iPhone\s*(?:(?:\d+,\d+)|(?:[A-Za-z]+))/i)
          if (modelMatch) {
            deviceModel = modelMatch[0]
          }
        } else if (userAgentLower.includes('ipad')) {
          deviceModel = 'iPad'
          // iPad 모델 상세 정보 추출 시도
          const modelMatch = userAgent.match(/iPad\s*(?:(?:\d+,\d+)|(?:[A-Za-z]+))/i)
          if (modelMatch) {
            deviceModel = modelMatch[0]
          }
        }
      } else if (userAgentLower.includes('android')) {
        os = 'Android'
        // Android 버전 추출
        const versionMatch = userAgent.match(/Android\s([0-9.]+)/)
        if (versionMatch) osVersion = versionMatch[1]
        
        // Android 기기 모델명 추출 (Build/ 이전의 문자열)
        const modelMatch = userAgent.match(/;\s([^;)]+)\sBuild\//)
        if (modelMatch) {
          deviceModel = modelMatch[1].trim()
        }
      } else if (userAgentLower.includes('windows')) {
        os = 'Windows'
        const match = userAgent.match(/Windows\sNT\s([0-9.]+)/)
        if (match) {
          const version = match[1]
          osVersion = {
            '10.0': '11/10',  // Windows 11 또는 10
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
            '6.0': 'Vista',
            '5.2': 'Server 2003/XP x64',
            '5.1': 'XP',
            '5.0': '2000'
          }[version] || version
        }
        
        // Windows 아키텍처 감지
        if (userAgentLower.includes('wow64') || userAgentLower.includes('win64')) {
          deviceModel = 'x64'
        } else {
          deviceModel = 'x86'
        }
      } else if (userAgentLower.includes('macintosh') || userAgentLower.includes('mac os')) {
        os = 'macOS'
        const match = userAgent.match(/Mac OS X\s*([0-9_\.]+)/)
        if (match) {
          osVersion = match[1].replace(/_/g, '.')
          // macOS 버전 이름 매핑
          const majorVersion = parseInt(osVersion.split('.')[0])
          if (majorVersion >= 11) {
            osVersion += ' (Big Sur 이상)'
          } else if (majorVersion === 10) {
            const minorVersion = parseInt(osVersion.split('.')[1])
            const versionNames: { [key: number]: string } = {
              15: 'Catalina',
              14: 'Mojave',
              13: 'High Sierra',
              12: 'Sierra',
              11: 'El Capitan',
              10: 'Yosemite',
              9: 'Mavericks',
              8: 'Mountain Lion',
              7: 'Lion',
              6: 'Snow Leopard'
            }
            if (versionNames[minorVersion]) {
              osVersion += ` (${versionNames[minorVersion]})`
            }
          }
        }
        
        // Mac 아키텍처 감지
        if (userAgentLower.includes('arm64')) {
          deviceModel = 'Apple Silicon'
        } else if (userAgentLower.includes('intel')) {
          deviceModel = 'Intel'
        }
      } else if (userAgentLower.includes('linux')) {
        os = 'Linux'
        // Linux 배포판 감지 시도
        if (userAgentLower.includes('ubuntu')) {
          osVersion = 'Ubuntu'
        } else if (userAgentLower.includes('fedora')) {
          osVersion = 'Fedora'
        } else if (userAgentLower.includes('debian')) {
          osVersion = 'Debian'
        }
        
        // Linux 아키텍처 감지
        if (userAgentLower.includes('x86_64') || userAgentLower.includes('x64')) {
          deviceModel = 'x64'
        } else if (userAgentLower.includes('arm')) {
          deviceModel = 'ARM'
        } else {
          deviceModel = 'x86'
        }
      }

      // 브라우저 감지
      let browser = 'unknown'
      let browserVersion = 'unknown'

      if (userAgentLower.includes('crios')) {
        browser = 'Chrome iOS'
        const match = userAgent.match(/CriOS\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('chrome')) {
        browser = 'Chrome'
        const match = userAgent.match(/Chrome\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('safari')) {
        browser = 'Safari'
        const match = userAgent.match(/Version\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('firefox')) {
        browser = 'Firefox'
        const match = userAgent.match(/Firefox\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('edg/')) {
        browser = 'Edge'
        const match = userAgent.match(/Edg\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('opr/')) {
        browser = 'Opera'
        const match = userAgent.match(/OPR\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      }

      setSystemInfo({
        appType: isPWA ? 'PWA' : 'Web',
        os,
        osVersion,
        browser,
        browserVersion,
        deviceModel,
        userAgent
      })
    }

    collectSystemInfo()
  }, [])

  const handleEdit = useCallback((memo: { id: string; content: string }) => {
    setEditingId(memo.id);
    setEditContent(memo.content);
  }, []);

  const handleSave = useCallback(async (memoId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const memoToUpdate = memos.find(m => m.id === memoId);
      if (memoToUpdate) {
        await updateMemo({
          ...memoToUpdate,
          content: editContent.trim(),
          updatedAt: new Date().toISOString()
        });
      }
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('메모 수정 중 오류:', error);
      alert('메모 수정에 실패했습니다.');
    }
  }, [editContent, updateMemo]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditContent('');
  }, []);

  if (typeof window === 'undefined') {
    return <div className="loading">로딩 중...</div>
  }

  const ios = isIOS();
  const [currentPage, setCurrentPage] = useState(1);

  // 스크롤 감지를 위한 ref
  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // 스크롤 이벤트 핸들러 (iOS가 아닌 환경용)
  const handleScroll = useCallback(async () => {
    // 기본 조건 체크
    if (ios || !hasMore || isLoading) {
      console.log('스크롤 무시:', { ios, hasMore, isLoading });
      return;
    }

    // 스크롤 위치 계산
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const distanceToBottom = documentHeight - (scrollTop + windowHeight);
    
    console.log('스크롤 상태:', {
      scrollTop,
      windowHeight,
      documentHeight,
      distanceToBottom,
      hasMore
    });

    // 하단에서 150px 이내일 때 추가 로드
    if (distanceToBottom < 150) {
      console.log('하단 감지, 추가 로드 시도');
      await loadMoreMemos();
    }
  }, [ios, hasMore, isLoading, loadMoreMemos]);

  // 스크롤 이벤트 리스너 등록 (iOS가 아닌 환경용)
  useEffect(() => {
    if (!ios) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [ios, handleScroll]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchMemos(true);
  }, [fetchMemos]);

  // 이전 페이지 로드
  const handlePrevPage = useCallback(async () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      await fetchMemos(true);
    }
  }, [currentPage, fetchMemos]);

  // 다음 페이지 로드
  const handleNextPage = useCallback(async () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
      await loadMoreMemos();
    }
  }, [hasMore, loadMoreMemos]);

  return (
    <div className="memo-list-container" ref={listContainerRef}>
      {ios && (
        <div className="ios-controls">
          <button className="refresh-button" onClick={handleRefresh}>
            <FaSync className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      )}
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
            <div key={memo.id} className="memo-item">
              {editingId === memo.id ? (
                <div className="memo-edit">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-buttons">
                    <button 
                      className="save-btn"
                      onClick={() => handleSave(memo.id)}
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
                    <span>
                      {new Date(memo.createdAt).toLocaleString('ko-KR')}
                    </span>
                    <div className="memo-actions">
                      {isMobile() ? (
                        <>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(memo)}
                            disabled={isLoading}
                            aria-label="수정"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                                deleteMemo(memo.id)
                              }
                            }}
                            disabled={isLoading}
                            aria-label="삭제"
                          >
                            <FaTrash size={14} />
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
                                deleteMemo(memo.id)
                              }
                            }}
                            disabled={isLoading}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        
        {/* 무한 스크롤 로딩 인디케이터 */}
        {isLoadingMore && (
          <div className="loading-more">
            <div className="loading-spinner-small" />
            <span>더 많은 메모를 불러오는 중...</span>
          </div>
        )}
        
        {/* iOS 페이지네이션 컨트롤 */}
        {ios && memos.length > 0 && (
          <div className="ios-pagination">
            {currentPage > 1 && (
              <button className="page-button prev" onClick={handlePrevPage} disabled={isLoading}>
                <FaChevronUp />
                <span>이전</span>
              </button>
            )}
            {hasMore && (
              <button className="page-button next" onClick={handleNextPage} disabled={isLoading}>
                <span>다음</span>
                <FaChevronDown />
              </button>
            )}
          </div>
        )}

        {/* 일반 브라우저용 로딩 표시 */}
        {!ios && isLoadingMore && (
          <div className="loading-more">
            <div className="loading-spinner-small" />
            <span>더 많은 메모를 불러오는 중...</span>
          </div>
        )}

        {/* 더 이상 로드할 메모가 없을 때 표시 */}
        {!hasMore && memos.length > 0 && (
          <div className="no-more-memos">
            <span>모든 메모를 불러왔습니다.</span>
          </div>
        )}
      </div>
      <div className="collection-info">
        <small>
          <div>앱 타입: {systemInfo.appType}</div>
          <div>운영체제: {systemInfo.os} {systemInfo.osVersion} ({systemInfo.deviceModel})</div>
          <div>브라우저: {systemInfo.browser} {systemInfo.browserVersion}</div>
          <div>User Agent: {systemInfo.userAgent}</div>
        </small>
      </div>
    </div>
  )
} 