import { useCallback, useSyncExternalStore } from 'react';
import { titleKey, type Title } from '../domain/title';
import { createLogger } from '../lib/logger';

const logger = createLogger('my-list');
const STORAGE_KEY = 'netflix-clone:my-list';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface MyListStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly Title[];
  toggle(title: Title): void;
}

function isTitle(value: unknown): value is Title {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Title>;
  return typeof candidate.id === 'number' && (candidate.mediaType === 'movie' || candidate.mediaType === 'tv');
}

function toListItem(title: Title): Title {
  const { id, mediaType, name, overview, backdropPath, posterPath, releaseYear, voteAverage, genreIds } = title;
  return { id, mediaType, name, overview, backdropPath, posterPath, releaseYear, voteAverage, genreIds };
}

export function createMyListStore(storage: KeyValueStorage | null): MyListStore {
  const listeners = new Set<() => void>();

  function read(): Title[] {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isTitle) : [];
    } catch (error) {
      logger.warn('Stored list is corrupted; starting empty', error);
      return [];
    }
  }

  let items: readonly Title[] = read();

  function persist() {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Quota exceeded or private mode: keep the in-memory list working.
      logger.warn('Could not persist list', error);
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => items,
    toggle(title) {
      const key = titleKey(title);
      items = items.some((item) => titleKey(item) === key)
        ? items.filter((item) => titleKey(item) !== key)
        : [toListItem(title), ...items];
      persist();
      listeners.forEach((listener) => listener());
    },
  };
}

function safeLocalStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const myListStore = createMyListStore(safeLocalStorage());

export function useMyList() {
  const items = useSyncExternalStore(myListStore.subscribe, myListStore.getSnapshot, myListStore.getSnapshot);
  const isInList = useCallback(
    (title: Pick<Title, 'id' | 'mediaType'>) => items.some((item) => titleKey(item) === titleKey(title)),
    [items],
  );
  return { items, isInList, toggle: myListStore.toggle };
}
