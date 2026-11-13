import type { TmdbClient } from '../tmdb/client';
import { TmdbError } from '../tmdb/errors';
import { createCatalogService } from './catalogService';
import type { ViewDefinition } from './definitions';

const item = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Title ${id}`,
  overview: 'Overview',
  backdrop_path: `/b${id}.jpg`,
  poster_path: `/p${id}.jpg`,
  ...extra,
});

const page = (results: unknown[]) => ({ page: 1, total_pages: 1, total_results: results.length, results });

function fakeClient(handler: (path: string) => unknown): TmdbClient & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    get: async <T,>(path: string) => {
      calls.push(path);
      const result = handler(path);
      if (result instanceof Error) throw result;
      return result as T;
    },
  };
}

const view: ViewDefinition = {
  title: 'Test',
  description: 'Test view',
  featured: { id: 'featured', title: 'Featured', path: '/shared', mediaType: 'movie' },
  rows: [
    { id: 'shared', title: 'Shared', path: '/shared', mediaType: 'movie' },
    { id: 'top10', title: 'Top', path: '/top', mediaType: 'tv', variant: 'top10' },
    { id: 'broken', title: 'Broken', path: '/broken', mediaType: 'movie' },
  ],
};

const options = { language: 'es-MX', region: 'MX', random: () => 0 };

describe('catalogService.loadView', () => {
  it('hides failing rows, trims top 10 and shares duplicated endpoints', async () => {
    const client = fakeClient((path) => {
      if (path === '/broken') return new TmdbError('http', 'boom', { status: 500 });
      if (path === '/top') return page(Array.from({ length: 15 }, (_, index) => item(index + 1)));
      return page([item(1), item(2, { backdrop_path: null })]);
    });
    const catalog = await createCatalogService({ client, ...options }).loadView(view);

    expect(catalog.rows.map((row) => row.id)).toEqual(['shared', 'top10']);
    expect(catalog.rows[0]?.items).toHaveLength(1);
    expect(catalog.rows[1]?.items).toHaveLength(10);
    expect(catalog.featured?.id).toBe(1);
    expect(client.calls.filter((path) => path === '/shared')).toHaveLength(1);
  });

  it('fails when no row could be loaded', async () => {
    const client = fakeClient(() => new TmdbError('network', 'offline'));
    await expect(createCatalogService({ client, ...options }).loadView(view)).rejects.toMatchObject({ kind: 'network' });
  });
});

describe('catalogService.loadDetails', () => {
  const details = { id: 7, title: 'Movie', overview: 'x' };

  it('caches details per title', async () => {
    const client = fakeClient(() => details);
    const service = createCatalogService({ client, ...options });

    await service.loadDetails({ id: 7, mediaType: 'movie' });
    await service.loadDetails({ id: 7, mediaType: 'movie' });
    expect(client.calls).toEqual(['/movie/7']);
  });

  it('keeps serving other consumers when one of them aborts', async () => {
    const client = fakeClient(() => details);
    const service = createCatalogService({ client, ...options });
    const controller = new AbortController();

    const first = service.loadDetails({ id: 7, mediaType: 'movie' }, controller.signal);
    const second = service.loadDetails({ id: 7, mediaType: 'movie' });
    controller.abort();

    await expect(first).rejects.toMatchObject({ kind: 'aborted' });
    await expect(second).resolves.toMatchObject({ id: 7, name: 'Movie' });
  });

  it('does not cache failures', async () => {
    let fail = true;
    const client = fakeClient(() => (fail ? new TmdbError('network', 'offline') : details));
    const service = createCatalogService({ client, ...options });

    await expect(service.loadDetails({ id: 7, mediaType: 'movie' })).rejects.toBeInstanceOf(TmdbError);
    fail = false;
    await expect(service.loadDetails({ id: 7, mediaType: 'movie' })).resolves.toMatchObject({ id: 7 });
  });
});

describe('catalogService.search', () => {
  it('skips empty queries and results without artwork', async () => {
    const client = fakeClient(() => page([item(1, { media_type: 'tv' }), item(2, { backdrop_path: null }), { id: 3, media_type: 'person' }]));
    const service = createCatalogService({ client, ...options });

    await expect(service.search('   ')).resolves.toEqual([]);
    expect(client.calls).toHaveLength(0);
    const results = await service.search('stranger');
    expect(results.map((title) => [title.id, title.mediaType])).toEqual([[1, 'tv']]);
  });
});
