import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  photoUrl?: string | null;
  isAdmin?: boolean;
  adminRole?: 'SUPER_ADMIN' | 'MODERATOR' | 'SUPPORT' | null;
  verifiedAt?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      isAdmin: () => {
        const { user } = get();
        return user?.isAdmin === true;
      },
      isSuperAdmin: () => {
        const { user } = get();
        return user?.isAdmin === true && user?.adminRole === 'SUPER_ADMIN';
      },
    }),
    {
      name: 'keora-auth-storage',
    }
  )
);
