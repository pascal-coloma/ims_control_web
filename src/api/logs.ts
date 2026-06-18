import { get } from "./client";
import type { LogEntry } from "../types/api";

export const LOGS_URL = "/ims/api/logs/";

export interface LogsPage {
  next: string | null;
  previous: string | null;
  results: LogEntry[];
}

// DRF builds next/previous as absolute URLs from the request it sees, which
// behind the dev/prod proxy is the backend's own host — fetching that
// directly from the browser skips the proxy and trips CORS. Strip it back
// down to a path so it's re-fetched through the same origin as everything else.
function toRelative(url: string | null): string | null {
  if (!url) return null;
  const { pathname, search } = new URL(url, window.location.origin);
  return `${pathname}${search}`;
}

/** Fetches one page of the cursor-paginated GET /ims/api/logs/ feed. */
export async function getLogsPage(
  url: string = LOGS_URL,
  signal?: AbortSignal,
): Promise<LogsPage> {
  const page = await get<LogsPage>(url, signal);
  return {
    ...page,
    next: toRelative(page.next),
    previous: toRelative(page.previous),
  };
}
