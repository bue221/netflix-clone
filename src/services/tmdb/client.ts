import { createLogger } from '../../lib/logger';
import { TmdbError } from './errors';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface TmdbClient {
  get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T>;
}

export interface TmdbClientOptions {
  apiKey: string;
  language: string;
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
}

const logger = createLogger('tmdb');

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new TmdbError('aborted', 'Request aborted'));
      },
      { once: true },
    );
  });

export function createTmdbClient({
  apiKey,
  language,
  baseUrl = 'https://api.themoviedb.org/3',
  timeoutMs = 10_000,
  retries = 1,
  retryDelayMs = 400,
  fetchImpl = (...args) => fetch(...args),
}: TmdbClientOptions): TmdbClient {
  function buildUrl(path: string, params: QueryParams): string {
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', language);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  async function attempt<T>(url: string, path: string, signal?: AbortSignal): Promise<T> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let response: Response;
    try {
      response = await fetchImpl(url, { signal: combined, headers: { Accept: 'application/json' } });
    } catch (cause) {
      if (signal?.aborted) throw new TmdbError('aborted', `Request to ${path} aborted`, { cause });
      if (timeout.aborted) throw new TmdbError('timeout', `Request to ${path} timed out after ${timeoutMs}ms`, { cause });
      throw new TmdbError('network', `Network error requesting ${path}`, { cause });
    }

    if (!response.ok) {
      throw new TmdbError('http', `TMDB responded ${response.status} for ${path}`, { status: response.status });
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new TmdbError('parse', `Invalid JSON from ${path}`, { cause });
    }
  }

  return {
    async get<T>(path: string, params: QueryParams = {}, signal?: AbortSignal): Promise<T> {
      if (!apiKey) throw new TmdbError('config', 'Missing TMDB API key');
      const url = buildUrl(path, params);

      for (let attemptNumber = 0; ; attemptNumber++) {
        try {
          return await attempt<T>(url, path, signal);
        } catch (error) {
          const canRetry = error instanceof TmdbError && error.retryable && attemptNumber < retries;
          if (!canRetry) throw error;
          logger.warn(`Retrying ${path} (${error.message})`);
          await sleep(retryDelayMs * 2 ** attemptNumber, signal);
        }
      }
    },
  };
}
