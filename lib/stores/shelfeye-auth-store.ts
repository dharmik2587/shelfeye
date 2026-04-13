"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthRole = "manager" | "worker" | "analyst";

interface AuthUser {
  name: string;
  email: string;
  role: AuthRole;
}

interface ShelfEyeAuthState {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (input: AuthUser) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useShelfEyeAuthStore = create<ShelfEyeAuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      isAuthenticated: false,
      user: null,
      login: (input) => set({ isAuthenticated: true, user: input }),
      logout: () => set({ isAuthenticated: false, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "shelfeye-auth-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
