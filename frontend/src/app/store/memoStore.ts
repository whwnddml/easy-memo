import { create } from 'zustand'

interface Memo {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  isOffline?: boolean;
}

interface MemoStore {
  memos: Memo[];
  isLoading: boolean;
  isHydrated: boolean;
  fetchMemos: () => Promise<void>;
  addMemo: (memo: Omit<Memo, 'id'>) => Promise<void>;
  updateMemo: (memo: Memo) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
}

const API_URL = 'https://port-0-memo-server-am952nlsu6unr5.sel5.cloudtype.app'

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

const useMemoStore = create<MemoStore>((set) => ({
  memos: [],
  isLoading: false,
  isHydrated: true,

  fetchMemos: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/memos`);
      const data = await response.json();
      set({ memos: data.map((memo: any) => ({
        id: memo._id,
        content: memo.content,
        userId: memo.userId || 'user123',
        createdAt: memo.createdAt,
        isOffline: false
      })) });
    } catch (error) {
      console.error('메모 목록 조회 중 오류:', error);
      alert('메모 목록을 불러오는데 실패했습니다.');
    } finally {
      set({ isLoading: false });
    }
  },

  addMemo: async (memo) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/memos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memo),
      });
      const newMemo = await response.json();
      set((state) => ({
        memos: [...state.memos, {
          id: newMemo._id,
          content: newMemo.content,
          userId: newMemo.userId,
          createdAt: newMemo.createdAt,
          isOffline: false
        }],
      }));
    } catch (error) {
      console.error('메모 추가 중 오류:', error);
      alert('메모 추가에 실패했습니다.');
    } finally {
      set({ isLoading: false });
    }
  },

  updateMemo: async (memo) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/memos/${memo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memo),
      });
      const updatedMemo = await response.json();
      set((state) => ({
        memos: state.memos.map((m) => 
          m.id === memo.id 
            ? {
                id: updatedMemo._id,
                content: updatedMemo.content,
                userId: updatedMemo.userId,
                createdAt: updatedMemo.createdAt,
                isOffline: false
              }
            : m
        ),
      }));
    } catch (error) {
      console.error('메모 수정 중 오류:', error);
      alert('메모 수정에 실패했습니다.');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMemo: async (id) => {
    set({ isLoading: true });
    try {
      await fetch(`${API_URL}/memos/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        memos: state.memos.filter((memo) => memo.id !== id),
      }));
    } catch (error) {
      console.error('메모 삭제 중 오류:', error);
      alert('메모 삭제에 실패했습니다.');
    } finally {
      set({ isLoading: false });
    }
  },
}))

export { useMemoStore }
export type { Memo } 