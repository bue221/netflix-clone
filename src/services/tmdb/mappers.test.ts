import { toTitle, toTitleDetails, toTitles } from './mappers';
import type { TmdbDetails } from './types';

describe('toTitle', () => {
  it('normalizes movies and tv shows', () => {
    expect(toTitle({ id: 1, title: 'Movie', release_date: '2021-05-01', vote_average: 7.5 }, 'movie')).toMatchObject({
      id: 1,
      mediaType: 'movie',
      name: 'Movie',
      releaseYear: 2021,
      voteAverage: 7.5,
      backdropPath: null,
    });
    expect(toTitle({ id: 2, name: 'Show', first_air_date: '2016-07-15', media_type: 'tv' }, 'movie')).toMatchObject({
      mediaType: 'tv',
      name: 'Show',
      releaseYear: 2016,
    });
  });

  it('drops people from mixed results', () => {
    expect(toTitles([{ id: 1, media_type: 'person', name: 'Actor' }, { id: 2, title: 'Movie' }], 'movie')).toHaveLength(1);
  });

  it('handles missing dates', () => {
    expect(toTitle({ id: 3, title: 'Untitled' }, 'movie')?.releaseYear).toBeNull();
  });
});

describe('toTitleDetails', () => {
  const base: TmdbDetails = {
    id: 10,
    name: 'Show',
    images: {
      logos: [
        { file_path: '/en.png', iso_639_1: 'en', vote_average: 5 },
        { file_path: '/es.png', iso_639_1: 'es', vote_average: 1 },
      ],
    },
    videos: {
      results: [
        { key: 'teaser', site: 'YouTube', type: 'Teaser' },
        { key: 'trailer', site: 'YouTube', type: 'Trailer', official: true },
        { key: 'vimeo', site: 'Vimeo', type: 'Trailer', official: true },
      ],
    },
    credits: { cast: [{ name: 'B', order: 1 }, { name: 'A', order: 0 }] },
    content_ratings: { results: [{ iso_3166_1: 'US', rating: 'TV-MA' }] },
    number_of_seasons: 3,
    episode_run_time: [50],
  };

  it('prefers the logo in the user language and official YouTube trailers', () => {
    const details = toTitleDetails(base, 'tv', { language: 'es-MX', region: 'MX' });
    expect(details.logoPath).toBe('/es.png');
    expect(details.trailerKey).toBe('trailer');
    expect(details.cast).toEqual(['A', 'B']);
    expect(details.seasons).toBe(3);
    expect(details.runtimeMinutes).toBe(50);
  });

  it('falls back to the US certification when the region has none', () => {
    expect(toTitleDetails(base, 'tv', { language: 'es-MX', region: 'MX' }).certification).toBe('TV-MA');

    const movie = toTitleDetails(
      {
        id: 11,
        title: 'Movie',
        release_dates: { results: [{ iso_3166_1: 'MX', release_dates: [{ certification: '' }, { certification: 'B15' }] }] },
      },
      'movie',
      { language: 'es-MX', region: 'MX' },
    );
    expect(movie.certification).toBe('B15');
  });

  it('falls back to another Spanish variant, then English, when the synopsis is missing', () => {
    const translations = (entries: [string, string, string][]) => ({
      translations: entries.map(([iso_639_1, iso_3166_1, overview]) => ({ iso_639_1, iso_3166_1, data: { overview } })),
    });
    const options = { language: 'es-MX', region: 'MX' };

    expect(toTitleDetails({ ...base, overview: 'Local' }, 'tv', options).overview).toBe('Local');
    expect(
      toTitleDetails({ ...base, overview: '', translations: translations([['en', 'US', 'English'], ['es', 'ES', 'Castellano']]) }, 'tv', options)
        .overview,
    ).toBe('Castellano');
    expect(
      toTitleDetails({ ...base, overview: '', translations: translations([['es', 'ES', ''], ['en', 'US', 'English']]) }, 'tv', options)
        .overview,
    ).toBe('English');
    expect(toTitleDetails({ ...base, overview: '' }, 'tv', options).overview).toBe('');
  });

  it('uses recommendations first and similar titles as fallback', () => {
    const withBoth = toTitleDetails(
      {
        ...base,
        recommendations: { page: 1, total_pages: 1, total_results: 1, results: [{ id: 1, name: 'Rec', backdrop_path: '/r.jpg' }] },
        similar: { page: 1, total_pages: 1, total_results: 1, results: [{ id: 2, name: 'Sim', backdrop_path: '/s.jpg' }] },
      },
      'tv',
      { language: 'es-MX', region: 'MX' },
    );
    expect(withBoth.similar.map((title) => title.name)).toEqual(['Rec']);

    const onlySimilar = toTitleDetails(
      {
        ...base,
        recommendations: { page: 1, total_pages: 1, total_results: 0, results: [] },
        similar: { page: 1, total_pages: 1, total_results: 1, results: [{ id: 2, name: 'Sim', backdrop_path: '/s.jpg' }] },
      },
      'tv',
      { language: 'es-MX', region: 'MX' },
    );
    expect(onlySimilar.similar.map((title) => title.name)).toEqual(['Sim']);
  });
});
