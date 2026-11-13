import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../services/tmdb/errors';

export type AsyncState<T> =
  | { status: 'idle'; data: undefined; error: undefined }
  | { status: 'loading'; data: T | undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: unknown };

const IDLE = { status: 'idle', data: undefined, error: undefined } as const;

/**
 * Runs `loader` whenever `key` changes, aborting the previous request so stale
 * responses never overwrite newer ones. Pass `key = null` to stay idle.
 * Data is kept while reloading the same key, and cleared when the key changes.
 */
export function useAsyncResource<T>(
  key: string | null,
  loader: (signal: AbortSignal) => Promise<T>,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>(IDLE);
  const [attempt, setAttempt] = useState(0);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const sameKey = lastKey.current === key;
    lastKey.current = key;
    if (key === null) {
      setState(IDLE);
      return;
    }
    const controller = new AbortController();
    setState((previous) => ({
      status: 'loading',
      data: sameKey && previous.status === 'success' ? previous.data : undefined,
      error: undefined,
    }));

    loader(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: undefined });
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setState({ status: 'error', data: undefined, error });
      },
    );

    return () => controller.abort();
    // `loader` is intentionally excluded: callers identify the request through `key`.
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, reload };
}
