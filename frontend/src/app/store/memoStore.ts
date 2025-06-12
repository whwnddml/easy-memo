import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'

export interface Memo {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
}

interface MemoStore {
  memos: Memo[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  fetchMemos: (reset?: boolean) => Promise<void>
  loadMoreMemos: () => Promise<void>
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => Promise<void>
  updateMemo: (memo: Memo) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  clearError: () => void
  clearMemos: () => void
}

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://junny.dyndns.org:3008'
  : 'http://localhost:3008';

// 로컬 스토리지에서 메모 관리
const getLocalMemos = (): Memo[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('local-memos');
  return stored ? JSON.parse(stored) : [];
};

const setLocalMemos = (memos: Memo[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('local-memos', JSON.stringify(memos));
};

// 고유 ID 생성
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 사용자 ID 가져오기 (로그인 상태에 따라)
const getUserId = () => {
  const authState = useAuthStore.getState();
  return authState.isAuthenticated ? authState.userId : null;
};

// JWT 토큰 가져오기
const getAuthToken = () => {
  const authState = useAuthStore.getState();
  return authState.isAuthenticated ? authState.token : null;
};

// 인증 헤더 생성
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      memos: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: true,
      currentPage: 1,

      fetchMemos: async (reset = true) => {
        const currentState = get();
        
        if (reset) {
          set({ isLoading: true, error: null, currentPage: 1, hasMore: true });
        }
        
        try {
          const userId = getUserId();
          
          if (!userId) {
            // 로그인하지 않은 경우 로컬 스토리지에서 가져오기
            const localMemos = getLocalMemos();
            set({ memos: localMemos, isLoading: false, hasMore: false });
            return;
          }

          // 로그인한 경우 서버에서 가져오기 (페이징 적용)
          const page = reset ? 1 : currentState.currentPage;
          const response = await fetch(`${API_URL}/api/memos?page=${page}&limit=20`, {
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('메모를 불러오는데 실패했습니다.');
          }

          const data = await response.json();
          const newMemos = data.memos.map((memo: any) => ({
            id: memo._id,
            content: memo.content,
            createdAt: memo.createdAt,
            updatedAt: memo.updatedAt
          }));

          set({ 
            memos: reset ? newMemos : [...currentState.memos, ...newMemos],
            isLoading: false,
            hasMore: data.pagination.hasMore,
            currentPage: data.pagination.currentPage
          });
        } catch (error) {
          console.error('메모 목록 조회 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모를 불러오는데 실패했습니다.',
            isLoading: false 
          });
        }
      },

      loadMoreMemos: async () => {
        const currentState = get();
        
        if (!currentState.hasMore || currentState.isLoadingMore || currentState.isLoading) {
          return;
        }

        set({ isLoadingMore: true, error: null });
        
        try {
          const userId = getUserId();
          
          if (!userId) {
            set({ isLoadingMore: false });
            return;
          }

          const nextPage = currentState.currentPage + 1;
          const response = await fetch(`${API_URL}/api/memos?page=${nextPage}&limit=20`, {
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('추가 메모를 불러오는데 실패했습니다.');
          }

          const data = await response.json();
          const newMemos = data.memos.map((memo: any) => ({
            id: memo._id,
            content: memo.content,
            createdAt: memo.createdAt,
            updatedAt: memo.updatedAt
          }));

          set({ 
            memos: [...currentState.memos, ...newMemos],
            isLoadingMore: false,
            hasMore: data.pagination.hasMore,
            currentPage: data.pagination.currentPage
          });
        } catch (error) {
          console.error('추가 메모 조회 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '추가 메모를 불러오는데 실패했습니다.',
            isLoadingMore: false 
          });
        }
      },

      addMemo: async (memo) => {
        set({ isLoading: true, error: null });
        
        try {
          const userId = getUserId();
          const newMemo: Memo = {
            id: generateId(),
            content: memo.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          if (!userId) {
            // 로그인하지 않은 경우 로컬 스토리지에 저장
            const currentMemos = get().memos;
            const updatedMemos = [newMemo, ...currentMemos];
            setLocalMemos(updatedMemos);
            set({ memos: updatedMemos, isLoading: false });
            return;
          }

          // 로그인한 경우 서버에 저장
          const response = await fetch(`${API_URL}/api/memos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
              content: memo.content
            }),
          });

          if (!response.ok) {
            throw new Error('메모 저장에 실패했습니다.');
          }

          const savedMemo = await response.json();
          const formattedMemo: Memo = {
            id: savedMemo._id,
            content: savedMemo.content,
            createdAt: savedMemo.createdAt,
            updatedAt: savedMemo.updatedAt
          };

          // 새 메모 추가 후 첫 페이지 다시 로드
          await get().fetchMemos(true);
        } catch (error) {
          console.error('메모 추가 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 저장에 실패했습니다.',
            isLoading: false 
          });
        }
      },

      updateMemo: async (memo) => {
        set({ isLoading: true, error: null });
        
        try {
          const userId = getUserId();

          if (!userId) {
            // 로그인하지 않은 경우 로컬 스토리지에서 수정
            const currentMemos = get().memos;
            const updatedMemos = currentMemos.map(m => 
              m.id === memo.id 
                ? { ...memo, updatedAt: new Date().toISOString() }
                : m
            );
            setLocalMemos(updatedMemos);
            set({ memos: updatedMemos, isLoading: false });
            return;
          }

          // 로그인한 경우 서버에서 수정
          const response = await fetch(`${API_URL}/api/memos/${memo.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
              content: memo.content
            }),
          });

          if (!response.ok) {
            throw new Error('메모 수정에 실패했습니다.');
          }

          const updatedMemo = await response.json();
          const formattedMemo: Memo = {
            id: updatedMemo._id,
            content: updatedMemo.content,
            createdAt: updatedMemo.createdAt,
            updatedAt: updatedMemo.updatedAt
          };

          // 메모 수정 후 현재 페이지 다시 로드
          await get().fetchMemos(true);
        } catch (error) {
          console.error('메모 수정 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 수정에 실패했습니다.',
            isLoading: false 
          });
        }
      },

      deleteMemo: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const userId = getUserId();

          if (!userId) {
            // 로그인하지 않은 경우 로컬 스토리지에서 삭제
            const currentMemos = get().memos;
            const updatedMemos = currentMemos.filter(m => m.id !== id);
            setLocalMemos(updatedMemos);
            set({ memos: updatedMemos, isLoading: false });
            return;
          }

          // 로그인한 경우 서버에서 삭제
          const response = await fetch(`${API_URL}/api/memos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('메모 삭제에 실패했습니다.');
          }

          // 메모 삭제 후 현재 페이지 다시 로드
          await get().fetchMemos(true);
        } catch (error) {
          console.error('메모 삭제 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 삭제에 실패했습니다.',
            isLoading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearMemos: () => {
        set({ 
          memos: [], 
          error: null, 
          currentPage: 1, 
          hasMore: true 
        });
      },
    }),
    {
      name: 'memo-storage',
      partialize: (state) => ({
        // 로그인하지 않은 경우에만 로컬 스토리지에 메모 저장
        memos: getUserId() ? [] : state.memos,
      }),
    }
  )
); 