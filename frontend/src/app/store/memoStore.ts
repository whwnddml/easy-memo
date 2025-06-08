import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Memo {
  _id?: string
  id?: number
  content: string
  createdAt: string
  updatedAt: string
  isOffline?: boolean
}

interface MemoStore {
  memos: Memo[]
  isLoading: boolean
  error: string | null
  fetchMemos: () => Promise<void>
  addMemo: (content: string) => Promise<void>
  deleteMemo: (id: string | number) => Promise<void>
  syncOfflineMemos: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const isProduction = process.env.NODE_ENV === 'production'

// 로컬 스토리지용 스토어
const createLocalStore = (set: any) => ({
  memos: [],
  isLoading: false,
  error: null,

  fetchMemos: async () => {
    set({ isLoading: true, error: null })
    try {
      const storedMemos = localStorage.getItem('memos')
      if (storedMemos) {
        set({ memos: JSON.parse(storedMemos), isLoading: false })
      } else {
        set({ memos: [], isLoading: false })
      }
    } catch (error) {
      set({ error: '메모를 불러오는데 실패했습니다', isLoading: false })
    }
  },

  addMemo: async (content: string) => {
    set({ isLoading: true, error: null })
    try {
      const newMemo = {
        id: Date.now(),
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: !navigator.onLine,
      }
      set((state: any) => {
        const newMemos = [newMemo, ...state.memos]
        localStorage.setItem('memos', JSON.stringify(newMemos))
        return { memos: newMemos, isLoading: false }
      })
    } catch (error) {
      set({ error: '메모 추가에 실패했습니다', isLoading: false })
    }
  },

  deleteMemo: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      set((state: any) => {
        const newMemos = state.memos.filter((memo: Memo) => memo.id !== id)
        localStorage.setItem('memos', JSON.stringify(newMemos))
        return { memos: newMemos, isLoading: false }
      })
    } catch (error) {
      set({ error: '메모 삭제에 실패했습니다', isLoading: false })
    }
  },

  syncOfflineMemos: async () => {
    if (!navigator.onLine) return

    set({ isLoading: true, error: null })
    try {
      const storedMemos = localStorage.getItem('memos')
      if (storedMemos) {
        const memos = JSON.parse(storedMemos)
        const offlineMemos = memos.filter((memo: Memo) => memo.isOffline)

        for (const memo of offlineMemos) {
          try {
            await fetch(`${API_URL}/memos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content: memo.content }),
            })
          } catch (error) {
            console.error('오프라인 메모 동기화 실패:', error)
          }
        }

        // 동기화된 메모 업데이트
        set((state: any) => {
          const newMemos = state.memos.map((memo: Memo) => ({
            ...memo,
            isOffline: false,
          }))
          localStorage.setItem('memos', JSON.stringify(newMemos))
          return { memos: newMemos, isLoading: false }
        })
      }
    } catch (error) {
      set({ error: '오프라인 메모 동기화에 실패했습니다', isLoading: false })
    }
  },
})

// 백엔드 API용 스토어
const createApiStore = (set: any) => ({
  memos: [],
  isLoading: false,
  error: null,

  fetchMemos: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/memos`)
      const data = await response.json()
      set({ memos: data, isLoading: false })
    } catch (error) {
      set({ error: '메모를 불러오는데 실패했습니다', isLoading: false })
    }
  },

  addMemo: async (content: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/memos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      const newMemo = await response.json()
      set((state: any) => ({
        memos: [newMemo, ...state.memos],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: '메모 추가에 실패했습니다', isLoading: false })
    }
  },

  deleteMemo: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await fetch(`${API_URL}/memos/${id}`, {
        method: 'DELETE',
      })
      set((state: any) => ({
        memos: state.memos.filter((memo: Memo) => memo._id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: '메모 삭제에 실패했습니다', isLoading: false })
    }
  },

  syncOfflineMemos: async () => {
    // 프로덕션 환경에서는 오프라인 동기화가 필요 없음
  },
})

// 환경에 따라 다른 스토어 생성
export const useMemoStore = create<MemoStore>()(
  isProduction
    ? createApiStore
    : persist(createLocalStore, {
        name: 'memo-storage',
      })
) 