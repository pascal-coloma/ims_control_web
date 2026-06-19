type Entry<T> = { promise: Promise<T>; controller: AbortController };

const cache = new Map<string, Entry<unknown>>();

export function useResource<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const existing = cache.get(key) as Entry<T> | undefined;
  if (existing) return existing.promise;

  const controller = new AbortController();
  const promise = fetcher(controller.signal).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { promise, controller });
  return promise;
}

export function invalidateResource(key: string): void {
  cache.get(key)?.controller.abort();
  cache.delete(key);
}

export function invalidateResourcesWithPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) invalidateResource(key);
  }
}
