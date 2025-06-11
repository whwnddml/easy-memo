import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Memo {
  _id?: string  // MongoDB의 _id
  id: string    // 로컬 ID (UUID)
  content: string
  createdAt: string
  isOffline?: boolean
  syncStatus?: 'pending' | 'synced' | 'failed'
}

interface MemoStore {
  memos: Memo[]
  isLoading: boolean
  isOnline: boolean
  error: string | null
  isHydrated: boolean
  fetchMemos: () => Promise<void>
  addMemo: (content: string) => Promise<void>
  updateMemo: (id: string, content: string) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  syncOfflineMemos: () => Promise<void>
  setOnlineStatus: (status: boolean) => void
  checkOnlineStatus: () => Promise<void>
  setHydrated: () => void
}

const API_URL = 'https://junny.dyndns.org:3008/api'

// 임시 userId (로그인 기능 전까지)
const DEFAULT_USER_ID = '665f1c000000000000000000'
const USER_ID_KEY = 'easymemo_userId'

let cachedUserId = DEFAULT_USER_ID
if (typeof window !== 'undefined') {
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = DEFAULT_USER_ID
    localStorage.setItem(USER_ID_KEY, userId)
  }
  cachedUserId = userId
}

function getUserId() {
  return cachedUserId
}

// UUID v4 생성 함수
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 서버 연결 상태 체크 함수
async function checkServerConnection(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 5000)  // 5초 타임아웃
    
    const response = await fetch(`${API_URL}/memos?userId=${getUserId()}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'include'
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error('서버 연결 체크 오류:', error)
    return false
  }
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      memos: [],
      isLoading: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      error: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      fetchMemos: async () => {
        const state = get()
        if (!state.isHydrated || state.isLoading) return

        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`${API_URL}/memos?userId=${getUserId()}`, {
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
          })

          if (!response.ok) {
            throw new Error('메모 목록 가져오기 실패')
          }

          const memos = await response.json()
          const formattedMemos = memos.map((memo: any) => ({
            _id: memo._id,
            id: memo._id,  // 서버 메모는 _id를 id로도 사용
            content: memo.content,
            createdAt: memo.createdAt,
            isOffline: false,
            syncStatus: 'synced'
          }))
          
          // 오프라인 메모와 서버 메모 병합
          const offlineMemos = state.memos.filter(memo => 
            memo.isOffline || memo.syncStatus === 'failed' || memo.syncStatus === 'pending'
          )
          
          set({ 
            memos: [...formattedMemos, ...offlineMemos],
            isLoading: false 
          })
        } catch (error) {
          console.error('메모 목록 가져오기 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '메모 목록 가져오기 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      checkOnlineStatus: async () => {
        const state = get()
        if (!state.isHydrated) return
        
        try {
          const isConnected = await checkServerConnection()
          
          if (isConnected) {
            set({ isOnline: true, isLoading: true })
            
            try {
              const response = await fetch(`${API_URL}/memos?userId=${getUserId()}`, {
                headers: {
                  'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include'
              })

              if (!response.ok) {
                throw new Error('메모 목록 가져오기 실패')
              }

              const memos = await response.json()
              const formattedMemos = memos.map((memo: any) => ({
                _id: memo._id,
                id: memo._id,
                content: memo.content,
                createdAt: memo.createdAt,
                isOffline: false,
                syncStatus: 'synced'
              }))

              // 오프라인 메모와 서버 메모 병합
              const offlineMemos = state.memos.filter(memo => 
                memo.isOffline || memo.syncStatus === 'failed' || memo.syncStatus === 'pending'
              )

              set({ 
                memos: [...formattedMemos, ...offlineMemos],
                isLoading: false,
                error: null
              })

              await get().syncOfflineMemos()
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : '메모 목록 가져오기 중 오류가 발생했습니다',
                isLoading: false
              })
            }
          } else {
            set({ isOnline: false })
          }
        } catch (error) {
          console.error('온라인 상태 체크 오류:', error)
          set({ 
            isOnline: false,
            error: '서버 연결 상태를 확인할 수 없습니다.'
          })
        }
      },

      setOnlineStatus: (status: boolean) => {
        const state = get()
        if (!state.isHydrated) return
        
        if (status) {
          get().checkOnlineStatus()
        } else {
          set({ isOnline: false })
        }
      },

      addMemo: async (content: string) => {
        const state = get()
        if (!state.isHydrated || !content.trim()) return

        set({ isLoading: true, error: null })
        await get().checkOnlineStatus()
        const { isOnline } = get()
        
        try {
          const newMemo: Memo = {
            id: generateUUID(),  // UUID 사용
            content,
            createdAt: new Date().toISOString(),
            isOffline: !isOnline,
            syncStatus: isOnline ? 'synced' : 'pending'
          }

          if (isOnline) {
            try {
              const response = await fetch(`${API_URL}/memos?userId=${getUserId()}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ content }),
              })

              if (!response.ok) {
                throw new Error('서버 응답 오류')
              }

              const serverMemo = await response.json()
              newMemo._id = serverMemo._id
              newMemo.createdAt = serverMemo.createdAt
            } catch (error) {
              console.error('메모 서버 저장 실패:', error)
              newMemo.isOffline = true
              newMemo.syncStatus = 'failed'
            }
          }

          set((state) => ({
            memos: [newMemo, ...state.memos],
            isLoading: false
          }))
        } catch (error) {
          console.error('메모 추가 중 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '메모 추가 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      updateMemo: async (id: string, content: string) => {
        const state = get()
        if (!state.isHydrated || !content.trim()) return

        set({ isLoading: true, error: null })
        const { isOnline, memos } = get()

        try {
          const memo = memos.find(m => m.id === id)  // id로만 검색
          
          if (!memo) {
            throw new Error('메모를 찾을 수 없습니다')
          }

          if (isOnline && memo._id && !memo.isOffline) {
            const response = await fetch(`${API_URL}/memos/${memo._id}?userId=${getUserId()}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              mode: 'cors',
              credentials: 'include',
              body: JSON.stringify({ content, userId: getUserId() })
            })

            if (!response.ok) {
              throw new Error('서버 응답 오류')
            }
          }

          set((state) => ({
            memos: state.memos.map((m) => 
              m.id === id  // id로만 비교
                ? { ...m, content, isOffline: !isOnline, syncStatus: isOnline ? 'synced' : 'pending' }
                : m
            ),
            isLoading: false
          }))

        } catch (error) {
          console.error('메모 수정 중 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '메모 수정 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      deleteMemo: async (id: string) => {
        const state = get()
        if (!state.isHydrated) return

        set({ isLoading: true, error: null })
        const { isOnline, memos } = get()

        try {
          const memo = memos.find(m => m.id === id)  // id로만 검색
          
          if (!memo) {
            throw new Error('메모를 찾을 수 없습니다')
          }

          if (isOnline && memo._id && !memo.isOffline) {
            const response = await fetch(`${API_URL}/memos/${memo._id}?userId=${getUserId()}`, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json'
              },
              mode: 'cors',
              credentials: 'include'
            })

            if (!response.ok) {
              throw new Error('서버 응답 오류')
            }
          }

          set((state) => ({
            memos: state.memos.filter((m) => m.id !== id),  // id로만 필터링
            isLoading: false
          }))

        } catch (error) {
          console.error('메모 삭제 중 오류:', error)
          set({ 
            error: error instanceof Error ? error.message : '메모 삭제 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      syncOfflineMemos: async () => {
        const state = get()
        if (!state.isHydrated || !state.isOnline) return

        const offlineMemos = state.memos.filter(
          (memo) => memo.isOffline || memo.syncStatus === 'failed' || memo.syncStatus === 'pending'
        )

        for (const memo of offlineMemos) {
          try {
            const response = await fetch(`${API_URL}/memos?userId=${getUserId()}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              mode: 'cors',
              credentials: 'include',
              body: JSON.stringify({ content: memo.content }),
            })

            if (!response.ok) {
              throw new Error('서버 응답 오류')
            }

            const serverMemo = await response.json()

            set((state) => ({
              memos: state.memos.map(m => 
                m.id === memo.id
                  ? {
                      ...m,
                      _id: serverMemo._id,
                      createdAt: serverMemo.createdAt,
                      isOffline: false,
                      syncStatus: 'synced'
                    }
                  : m
              )
            }))
          } catch (error) {
            console.error('오프라인 메모 동기화 실패:', error)
            // 동기화 실패 시 해당 메모의 상태만 업데이트
            set((state) => ({
              memos: state.memos.map(m =>
                m.id === memo.id
                  ? { ...m, syncStatus: 'failed' }
                  : m
              ),
              error: `메모 동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
            }))
          }
        }
      }
    }),
    {
      name: 'memo-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        memos: state.memos,
        isOnline: state.isOnline
      })
    }
  )
) 