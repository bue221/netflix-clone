import type { Title } from '../domain/title';
import { createMyListStore, type KeyValueStorage } from './myListStore';

const title: Title = {
  id: 1,
  mediaType: 'tv',
  name: 'Show',
  overview: '',
  backdropPath: '/b.jpg',
  posterPath: null,
  releaseYear: 2020,
  voteAverage: 8,
  genreIds: [18],
};

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('myListStore', () => {
  it('toggles titles, notifies listeners and persists', () => {
    const storage = memoryStorage();
    const store = createMyListStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    store.toggle(title);
    expect(store.getSnapshot()).toEqual([title]);
    expect(JSON.parse(Object.values(storage.data)[0] ?? '[]')).toHaveLength(1);

    store.toggle(title);
    expect(store.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('restores persisted titles and ignores corrupted data', () => {
    const persisted = createMyListStore(memoryStorage({ 'netflix-clone:my-list': JSON.stringify([title, { bad: true }]) }));
    expect(persisted.getSnapshot()).toEqual([title]);

    const corrupted = createMyListStore(memoryStorage({ 'netflix-clone:my-list': '{not json' }));
    expect(corrupted.getSnapshot()).toEqual([]);
  });

  it('keeps working in memory when storage writes fail', () => {
    const store = createMyListStore({
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      },
    });
    store.toggle(title);
    expect(store.getSnapshot()).toHaveLength(1);
  });
});
