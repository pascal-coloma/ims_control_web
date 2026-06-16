import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * Guards the authenticated app shell per §1.3:
 * - no session -> /login
 * - mid-MFA -> /login/mfa
 * - authenticated but wrong role -> blocked screen (handled by RoleGuard below)
 * - otherwise renders the protected routes
 */
export function AuthGuard() {
  const status = useAuthStore((state) => state.status)

  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (status === 'pending_mfa') return <Navigate to="/login/mfa" replace />

  return <Outlet />
}

/**
 * Blocks any authenticated user whose role isn't "control" (§1.3). The backend
 * would 403 on every endpoint anyway, but this avoids a wall of error toasts.
 */
export function RoleGuard() {
  const user = useAuthStore((state) => state.user)

  if (user && user.role !== 'control') return <Navigate to="/role-blocked" replace />

  return <Outlet />
}

/** Redirects an already-authenticated control user away from /login. */
export function GuestGuard() {
  const status = useAuthStore((state) => state.status)

  if (status === 'authenticated') return <Navigate to="/despachos" replace />

  return <Outlet />
}
