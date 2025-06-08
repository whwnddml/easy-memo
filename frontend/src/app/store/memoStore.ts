import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Memo {
  _id?: string  // MongoDB의 _id
  id: string    // 로컬 ID
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
  fetchMemos: () => Promise<void>
  addMemo: (content: string) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  syncOfflineMemos: () => Promise<void>
  setOnlineStatus: (status: boolean) => void
  checkOnlineStatus: () => Promise<void>
}

const API_URL = 'https://junny.dyndns.org:3008/api'

const checkServerConnection = async () => {
  try {
    console.log('서버 연결 상태 확인 중...');
    const response = await fetch(`${API_URL}/memos`, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'include'
    });
    console.log('서버 응답:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.error('서버 연결 확인 실패:', error);
    return false;
  }
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      memos: [],
      isLoading: false,
      isOnline: false,
      error: null,

      fetchMemos: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/memos`, {
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('메모 목록 가져오기 실패');
          }

          const memos = await response.json();
          set({ memos, isLoading: false });
        } catch (error) {
          console.error('메모 목록 가져오기 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 목록 가져오기 중 오류가 발생했습니다',
            isLoading: false 
          });
        }
      },

      checkOnlineStatus: async () => {
        console.log('온라인 상태 체크 시작');
        const isConnected = await checkServerConnection();
        console.log('온라인 상태:', isConnected);
        set({ isOnline: isConnected });
        if (isConnected) {
          get().fetchMemos();
          get().syncOfflineMemos();
        }
      },

      setOnlineStatus: (status: boolean) => {
        console.log('브라우저 온라인 상태 변경:', status);
        if (status) {
          get().checkOnlineStatus();
        } else {
          set({ isOnline: false });
        }
      },

      addMemo: async (content: string) => {
        set({ isLoading: true, error: null });
        await get().checkOnlineStatus();
        const { isOnline } = get();
        console.log('메모 추가 시 온라인 상태:', isOnline);
        
        try {
          const newMemo: Memo = {
            id: Date.now().toString(),
            content,
            createdAt: new Date().toISOString(),
            isOffline: !isOnline,
            syncStatus: isOnline ? 'synced' : 'pending'
          };

          if (isOnline) {
            try {
              console.log('서버에 메모 저장 시도');
              const response = await fetch(`${API_URL}/memos`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ content }),
              });

              if (!response.ok) {
                throw new Error('서버 응답 오류');
              }

              const serverMemo = await response.json();
              console.log('서버 응답 메모:', serverMemo);
              newMemo.id = serverMemo.id;
              newMemo.createdAt = serverMemo.createdAt;
            } catch (error) {
              console.error('메모 서버 저장 실패:', error);
              newMemo.isOffline = true;
              newMemo.syncStatus = 'failed';
            }
          }

          set((state) => ({
            memos: [newMemo, ...state.memos],
            isLoading: false
          }));
        } catch (error) {
          console.error('메모 추가 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 추가 중 오류가 발생했습니다',
            isLoading: false 
          });
        }
      },

      deleteMemo: async (id: string) => {
        set({ isLoading: true, error: null });
        const { isOnline } = get();

        try {
          if (isOnline) {
            console.log('메모 삭제 요청:', id);
            const response = await fetch(`${API_URL}/memos/${id}`, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json'
              },
              mode: 'cors',
              credentials: 'include'
            });

            if (!response.ok) {
              throw new Error('서버 응답 오류');
            }
            
            console.log('메모 삭제 성공:', id);
          }

          // 로컬 상태 업데이트
          set((state) => {
            console.log('현재 메모 목록:', state.memos);
            const updatedMemos = state.memos.filter((memo) => {
              const memoId = memo._id || memo.id;
              console.log('비교:', memoId, id);
              return memoId !== id;
            });
            console.log('필터링된 메모 목록:', updatedMemos);
            return {
              memos: updatedMemos,
              isLoading: false
            };
          });

        } catch (error) {
          console.error('메모 삭제 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '메모 삭제 중 오류가 발생했습니다',
            isLoading: false 
          });
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