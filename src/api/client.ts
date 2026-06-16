// Thin fetch wrapper implementing the session/CSRF contract from
// control_web_interface_prompt.xml (<authentication_and_session>, <error_conventions>).

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }

  get errorMessage(): string | null {
    if (this.body && typeof this.body === "object" && "error" in this.body) {
      const value = (this.body as { error?: unknown }).error;
      return typeof value === "string" ? value : null;
    }
    return null;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the global 401/403 handlers (used by the login/MFA screens). */
  skipAuthHandlers?: boolean;
}

interface AuthHandlers {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}

let authHandlers: AuthHandlers = {};

export function setAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, skipAuthHandlers } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrftoken = getCookie("csrftoken");
    if (csrftoken) headers["X-CSRFToken"] = csrftoken;
  }

  const response = await fetch(path, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!skipAuthHandlers) {
    if (response.status === 401) authHandlers.onUnauthorized?.();
    else if (response.status === 403) authHandlers.onForbidden?.();
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      /* no JSON body */
    }
    throw new ApiError(response.status, payload);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(path, { method: "GET", signal });
}

export function post<T>(
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "POST", body });
}

export function patch<T>(
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "PATCH", body });
}
