import { createTmdbClient } from './client';
import { TmdbError, toUserMessage } from './errors';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function setup(fetchImpl: typeof fetch, overrides: Partial<Parameters<typeof createTmdbClient>[0]> = {}) {
  return createTmdbClient({ apiKey: 'key', language: 'es-MX', retryDelayMs: 0, fetchImpl, ...overrides });
}

describe('createTmdbClient', () => {
  it('adds the api key, language and params to the url', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    await setup(fetchImpl).get('/movie/popular', { page: 2, skip: undefined });

    const url = new URL(String(fetchImpl.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/3/movie/popular');
    expect(url.searchParams.get('api_key')).toBe('key');
    expect(url.searchParams.get('language')).toBe('es-MX');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.has('skip')).toBe(false);
  });

  it('retries retryable failures and then succeeds', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ results: [] }));

    await expect(setup(fetchImpl).get('/trending/all/week')).resolves.toEqual({ results: [] });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not retry client errors', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 404));

    const error = await setup(fetchImpl).get('/movie/0').catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(TmdbError);
    expect((error as TmdbError).status).toBe(404);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('classifies network failures', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(setup(fetchImpl, { retries: 0 }).get('/x')).rejects.toMatchObject({ kind: 'network' });
  });

  it('times out slow requests', async () => {
    const fetchImpl: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)));
    await expect(setup(fetchImpl, { timeoutMs: 10, retries: 0 }).get('/slow')).rejects.toMatchObject({
      kind: 'timeout',
    });
  });

  it('reports caller aborts without retrying', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn<typeof fetch>((_url, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
    );
    const request = setup(fetchImpl).get('/x', {}, controller.signal);
    controller.abort();
    await expect(request).rejects.toMatchObject({ kind: 'aborted' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails fast with a config error when the key is missing', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const error = await setup(fetchImpl, { apiKey: '' }).get('/x').catch((reason: unknown) => reason);
    expect(error).toMatchObject({ kind: 'config' });
    expect(toUserMessage(error)).toMatch(/VITE_TMDB_API_KEY/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
