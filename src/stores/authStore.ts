import { create } from "zustand";
import type { AuthUser } from "../types/api";

export type AuthStatus = "unauthenticated" | "pending_mfa" | "authenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** Set when a global 401 fires outside the login flow (session expired). */
  sessionExpired: boolean;
  setPendingMfa: () => void;
  setAuthenticated: (user: AuthUser) => void;
  logout: (opts?: { sessionExpired?: boolean }) => void;
  clearSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unauthenticated",
  user: null,
  sessionExpired: false,
  setPendingMfa: () => set({ status: "pending_mfa" }),
  setAuthenticated: (user) =>
    set({ status: "authenticated", user, sessionExpired: false }),
  logout: (opts) =>
    set({
      status: "unauthenticated",
      user: null,
      sessionExpired: !!opts?.sessionExpired,
    }),
  clearSessionExpired: () => set({ sessionExpired: false }),
}));
