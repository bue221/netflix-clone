import type { CatalogRow, Title, TitleDetails } from '../../domain/title';
import { createLogger } from '../../lib/logger';
import type { TmdbClient } from '../tmdb/client';
import { TmdbError } from '../tmdb/errors';
import { toTitleDetails, toTitles } from '../tmdb/mappers';
import type { TmdbDetails, TmdbListItem, TmdbPage } from '../tmdb/types';
import type { RowDefinition, ViewDefinition } from './definitions';

const logger = createLogger('catalog');

export interface BrowseCatalog {
  featured: Title | null;
  rows: CatalogRow[];
}

export interface CatalogService {
  loadView(view: ViewDefinition, signal?: AbortSignal): Promise<BrowseCatalog>;
  loadDetails(title: Pick<Title, 'id' | 'mediaType'>, signal?: AbortSignal): Promise<TitleDetails>;
  search(query: string, signal?: AbortSignal): Promise<Title[]>;
}

interface CatalogServiceOptions {
  client: TmdbClient;
  language: string;
  region: string;
  random?: () => number;
  detailsCacheSize?: number;
}

const TOP10_SIZE = 10;

/** Lets a caller stop waiting for a shared promise without cancelling it for everyone else. */
function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new TmdbError('aborted', 'Request aborted'));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new TmdbError('aborted', 'Request aborted'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

function hasArtwork(row: RowDefinition) {
  return (title: Title) => (row.variant === 'default' || !row.variant ? title.backdropPath : title.posterPath) !== null;
}

export function createCatalogService({
  client,
  language,
  region,
  random = Math.random,
  detailsCacheSize = 50,
}: CatalogServiceOptions): CatalogService {
  const detailsCache = new Map<string, Promise<TitleDetails>>();

  async function loadRow(
    row: RowDefinition,
    fetchPage: (row: RowDefinition) => Promise<TmdbPage<TmdbListItem>>,
  ): Promise<CatalogRow> {
    const page = await fetchPage(row);
    const items = toTitles(page.results, row.mediaType).filter(hasArtwork(row));
    return {
      id: row.id,
      title: row.title,
      variant: row.variant ?? 'default',
      items: row.variant === 'top10' ? items.slice(0, TOP10_SIZE) : items,
    };
  }

  function pickFeatured(items: Title[]): Title | null {
    const candidates = items.filter((title) => title.backdropPath && title.overview);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(random() * candidates.length)] ?? null;
  }

  return {
    async loadView(view, signal) {
      // The billboard often reuses a row's endpoint; share one request per endpoint.
      const pages = new Map<string, Promise<TmdbPage<TmdbListItem>>>();
      const fetchPage = (row: RowDefinition) => {
        const key = `${row.path}?${JSON.stringify(row.params ?? {})}`;
        let page = pages.get(key);
        if (!page) {
          page = client.get<TmdbPage<TmdbListItem>>(row.path, row.params, signal);
          pages.set(key, page);
        }
        return page;
      };

      const [featuredResult, ...rowResults] = await Promise.allSettled([
        loadRow(view.featured, fetchPage),
        ...view.rows.map((row) => loadRow(row, fetchPage)),
      ]);

      if (signal?.aborted) throw signal.reason;

      const rows: CatalogRow[] = [];
      let firstError: unknown;
      rowResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.items.length > 0) rows.push(result.value);
          return;
        }
        firstError ??= result.reason;
        logger.warn(`Row "${view.rows[index]?.id}" failed and will be hidden`, result.reason);
      });

      // A partially broken page is still useful; only fail when there is nothing to show.
      if (rows.length === 0 && firstError) throw firstError;

      const featuredPool =
        featuredResult?.status === 'fulfilled' ? featuredResult.value.items : (rows[0]?.items ?? []);
      return { featured: pickFeatured(featuredPool), rows };
    },

    loadDetails({ id, mediaType }, signal) {
      const key = `${mediaType}-${id}`;
      const cached = detailsCache.get(key);
      if (cached) return abortable(cached, signal);

      // The shared request is deliberately not tied to any caller's signal: one consumer
      // unmounting must not cancel the response other consumers are waiting for.
      const request = client
        .get<TmdbDetails>(`/${mediaType}/${id}`, {
          append_to_response: `images,videos,credits,recommendations,similar,translations,${mediaType === 'tv' ? 'content_ratings' : 'release_dates'}`,
          include_image_language: `${language.split('-')[0]},en,null`,
          include_video_language: `${language.split('-')[0]},en`,
        })
        .then((details) => toTitleDetails(details, mediaType, { language, region }));

      request.catch((error: unknown) => {
        detailsCache.delete(key);
        logger.error(`Details for ${key} failed`, error);
      });

      detailsCache.set(key, request);
      if (detailsCache.size > detailsCacheSize) {
        const oldest = detailsCache.keys().next().value;
        if (oldest !== undefined) detailsCache.delete(oldest);
      }
      return abortable(request, signal);
    },

    async search(query, signal) {
      const trimmed = query.trim();
      if (!trimmed) return [];
      const page = await client.get<TmdbPage<TmdbListItem>>(
        '/search/multi',
        { query: trimmed, include_adult: false },
        signal,
      );
      return toTitles(page.results, 'movie').filter((title) => title.backdropPath);
    },
  };
}
