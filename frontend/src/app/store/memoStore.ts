import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Memo {
  id: string
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
  addMemo: (content: string) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  syncOfflineMemos: () => Promise<void>
  setOnlineStatus: (status: boolean) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://junny.dyndns.org:3005/api'

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      memos: [],
      isLoading: false,
      isOnline: false,
      error: null,

      setOnlineStatus: (status: boolean) => {
        const { isOnline: currentIsOnline } = get()
        fetch(`${API_URL}/health`)
          .then(response => {
            if (response.ok) {
              set({ isOnline: true })
              get().syncOfflineMemos()
            } else {
              set({ isOnline: false })
            }
          })
          .catch(() => {
            set({ isOnline: false })
          })
      },

      addMemo: async (content: string) => {
        set({ isLoading: true, error: null })
        const { isOnline } = get()
        
        try {
          const newMemo: Memo = {
            id: Date.now().toString(),
            content,
            createdAt: new Date().toISOString(),
            isOffline: !isOnline,
            syncStatus: isOnline ? 'synced' : 'pending'
          }

          if (isOnline) {
            try {
              const response = await fetch(`${API_URL}/memos`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
              })

              if (!response.ok) {
                throw new Error('서버 응답 오류')
              }

              const serverMemo = await response.json()
              newMemo.id = serverMemo.id
              newMemo.createdAt = serverMemo.createdAt
            } catch (error) {
              newMemo.isOffline = true
              newMemo.syncStatus = 'failed'
              console.error('메모 서버 저장 실패:', error)
            }
          }

          set((state) => ({
            memos: [newMemo, ...state.memos],
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '메모 추가 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      deleteMemo: async (id: string) => {
        set({ isLoading: true, error: null })
        const { isOnline } = get()

        try {
          if (isOnline) {
            try {
              const response = await fetch(`${API_URL}/memos/${id}`, {
                method: 'DELETE',
              })

              if (!response.ok) {
                throw new Error('서버 응답 오류')
              }
            } catch (error) {
              console.error('메모 서버 삭제 실패:', error)
              // 오프라인이거나 서버 오류 시에도 로컬에서는 삭제 진행
            }
          }

          set((state) => ({
            memos: state.memos.filter((memo) => memo.id !== id),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '메모 삭제 중 오류가 발생했습니다',
            isLoading: false 
          })
        }
      },

      syncOfflineMemos: async () => {
        const { memos, isOnline } = get()
        if (!isOnline) return

        const offlineMemos = memos.filter(
          (memo) => memo.isOffline || memo.syncStatus === 'failed' || memo.syncStatus === 'pending'
        )

        for (const memo of offlineMemos) {
          try {
            const response = await fetch(`${API_URL}/memos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content: memo.content }),
            })

            if (!response.ok) {
              throw new Error('서버 응답 오류')
            }

            const serverMemo = await response.json()

            set((state) => ({
              memos: state.memos.map((m) =>
                m.id === memo.id
                  ? {
                      ...m,
                      id: serverMemo.id,
                      isOffline: false,
                      syncStatus: 'synced',
                    }
                  : m
              ),
            }))
          } catch (error) {
            console.error('오프라인 메모 동기화 실패:', error)
            // 실패한 메모는 다음 동기화 시도를 위해 상태 업데이트
            set((state) => ({
              memos: state.memos.map((m) =>
                m.id === memo.id
                  ? { ...m, syncStatus: 'failed' }
                  : m
              ),
            }))
          }
        }
      }
    }),
    {
      name: 'memo-storage',
      skipHydration: true
    }
  )
) 