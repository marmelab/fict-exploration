import type { ResourceName, Resources } from "./types";

const DEFAULT_DATA_PROVIDER = "https://jsonplaceholder.typicode.com";

/**
 * Module-level promise cache, the plain-JS analogue of Fict's `resource()`.
 *
 * `{#await}` re-subscribes when the derived promise changes identity, so the
 * same key has to yield the same promise or every re-render refires it.
 */
const cache = new Map<string, Promise<unknown>>();
const controllers = new Map<string, AbortController>();

function cached<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const pending = cache.get(key);
  if (pending) return pending as Promise<T>;

  const controller = new AbortController();
  const promise = fetcher(controller.signal);

  // Keep the rejection cached. Evicting here hands the next read a fresh
  // promise, which refetches a failing endpoint on every render attempt.
  // Retry goes through `invalidate(key)`. The no-op handler marks it handled.
  promise.catch(() => {});

  cache.set(key, promise);
  controllers.set(key, controller);
  return promise;
}

/** Abort and forget one cache entry, or the whole cache when no key is given. */
export function invalidate(key?: string) {
  const keys = key != null ? [key] : [...cache.keys()];
  for (const k of keys) {
    controllers.get(k)?.abort();
    controllers.delete(k);
    cache.delete(k);
  }
}

export function getList<T extends ResourceName>(
  resource: T,
): Promise<Resources[T][]> {
  return cached(resource, async (signal) => {
    const response = await fetch(`${DEFAULT_DATA_PROVIDER}/${resource}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }
    return (await response.json()) as Resources[T][];
  });
}

export function getOne<T extends ResourceName>(
  resource: T,
  id: number,
): Promise<Resources[T]> {
  return cached(`${resource}/${id}`, async (signal) => {
    const response = await fetch(`${DEFAULT_DATA_PROVIDER}/${resource}/${id}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource} with id ${id}`);
    }
    return (await response.json()) as Resources[T];
  });
}
