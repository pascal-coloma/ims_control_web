import { create } from "zustand";
import { persist } from "zustand/middleware";
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

// Persists only the authenticated user across reloads so a hard refresh
// doesn't bounce the user to /login while the Django session cookie is
// still valid. The cookie remains the real auth boundary: if it expired
// server-side, the next request 401s and the existing global handler logs
// out (see api/client.ts). pending_mfa is deliberately never persisted —
// a refresh mid-MFA must redo step 1.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "ims-auth",
      partialize: (state) =>
        state.status === "authenticated"
          ? { status: state.status, user: state.user }
          : { status: "unauthenticated" as const, user: null },
    },
  ),
);
