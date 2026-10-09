import { shallowRef, watchEffect, type Ref } from "vue";

export type AsyncState<T> = {
  data: Ref<T | null>;
  error: Ref<unknown>;
  pending: Ref<boolean>;
};

/**
 * Vapor mode has no `<Suspense>` yet, so async reads are plain refs driven by a
 * watcher. `watchEffect` re-runs `source` when the route changes, and the
 * promise cache makes a repeat read free.
 */
export function useAsync<T>(source: () => Promise<T>): AsyncState<T> {
  const data = shallowRef<T | null>(null);
  const error = shallowRef<unknown>(null);
  const pending = shallowRef(true);
  // Guards against an earlier request resolving after a later one.
  let token = 0;

  watchEffect(() => {
    const current = ++token;
    const promise = source();
    pending.value = true;
    error.value = null;
    promise.then(
      (value) => {
        if (current !== token) return;
        data.value = value;
        pending.value = false;
      },
      (err: unknown) => {
        if (current !== token) return;
        error.value = err;
        pending.value = false;
      },
    );
  });

  return { data, error, pending };
}
