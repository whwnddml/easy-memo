import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  socialProvider?: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('API URL이 설정되지 않았습니다.');
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      token: null,
      userId: null,
      user: null,
      isLoading: false,
      error: null,

      // 로그인
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
          }

          set({
            isAuthenticated: true,
            token: data.token,
            userId: data.userId,
            user: data.user,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
          });
          return false;
        }
      },

      // 로그아웃
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          userId: null,
          user: null,
          error: null,
        });
      },

      // 토큰 검증
      verifyToken: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }

        try {
          const response = await fetch(`${API_URL}/users/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || '토큰 검증에 실패했습니다.');
          }

          set({
            isAuthenticated: true,
            userId: data.userId,
            user: data.user,
          });

          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            token: null,
            userId: null,
            user: null,
          });
          return false;
        }
      },

      // 에러 클리어
      clearError: () => {
        set({ error: null });
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 