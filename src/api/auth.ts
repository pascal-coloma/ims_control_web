import { apiFetch } from "./client";
import type { AuthUser } from "../types/api";

export interface LoginResponse {
  session: string;
  user_data: AuthUser;
}

/** Step 1: POST /ims/api/auth/ — credentials. 401s are handled inline by the form. */
export function login(username: string, password: string): Promise<unknown> {
  return apiFetch("/ims/api/auth/", {
    method: "POST",
    body: { username, password },
    skipAuthHandlers: true,
  });
}

/** Obtains a csrftoken cookie before the TOTP step (ensure_csrf_cookie). */
export function ensureCsrfCookie(): Promise<unknown> {
  return apiFetch("/ims/api/login/", { method: "GET", skipAuthHandlers: true });
}

/** Step 2: POST /ims/api/login/ — TOTP code. 401s are handled inline by the form. */
export function verifyTotp(totpCode: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/ims/api/login/", {
    method: "POST",
    body: { totp_code: totpCode },
    skipAuthHandlers: true,
  });
}

/** Invalidates the Django session server-side. */
export function logoutApi(): Promise<unknown> {
  return apiFetch("/ims/api/logout/", {
    method: "POST",
    skipAuthHandlers: true,
  });
}
