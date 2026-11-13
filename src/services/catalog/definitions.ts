import type { MediaType, RowVariant } from '../../domain/title';
import type { QueryParams } from '../tmdb/client';

export type BrowseView = 'home' | 'tv' | 'movie' | 'latest';

export interface RowDefinition {
  id: string;
  title: string;
  path: string;
  params?: QueryParams;
  /** Used when the endpoint does not return `media_type` per item. */
  mediaType: MediaType;
  variant?: RowVariant;
}

export interface ViewDefinition {
  title: string;
  description: string;
  /** Row whose items feed the billboard; it is not rendered as a row unless also listed in `rows`. */
  featured: RowDefinition;
  rows: RowDefinition[];
}

const NETFLIX_NETWORK_ID = 213;

const discoverMovies = (id: string, title: string, genre: number): RowDefinition => ({
  id,
  title,
  path: '/discover/movie',
  params: { with_genres: genre, sort_by: 'popularity.desc' },
  mediaType: 'movie',
});

const discoverTv = (id: string, title: string, genre: number): RowDefinition => ({
  id,
  title,
  path: '/discover/tv',
  params: { with_genres: genre, sort_by: 'popularity.desc' },
  mediaType: 'tv',
});

const netflixOriginals: RowDefinition = {
  id: 'originals',
  title: 'Solo en Netflix',
  path: '/discover/tv',
  params: { with_networks: NETFLIX_NETWORK_ID, sort_by: 'popularity.desc' },
  mediaType: 'tv',
  variant: 'poster',
};

const top10Tv: RowDefinition = {
  id: 'top10-tv',
  title: 'Top 10 series de hoy',
  path: '/trending/tv/day',
  mediaType: 'tv',
  variant: 'top10',
};

const top10Movies: RowDefinition = {
  id: 'top10-movies',
  title: 'Top 10 películas de hoy',
  path: '/trending/movie/day',
  mediaType: 'movie',
  variant: 'top10',
};

export const VIEWS: Record<BrowseView, ViewDefinition> = {
  home: {
    title: 'Inicio',
    description: 'Mira series, películas y originales de Netflix: tendencias, top 10 y estrenos.',
    featured: { ...netflixOriginals, variant: 'default' },
    rows: [
      { id: 'trending', title: 'Tendencias ahora', path: '/trending/all/week', mediaType: 'movie' },
      top10Tv,
      netflixOriginals,
      { id: 'popular-movies', title: 'Películas populares', path: '/movie/popular', mediaType: 'movie' },
      { id: 'top-rated', title: 'Aclamadas por la crítica', path: '/movie/top_rated', mediaType: 'movie' },
      discoverMovies('action', 'Películas de acción', 28),
      discoverMovies('comedy', 'Comedias', 35),
      top10Movies,
      discoverMovies('horror', 'Películas de terror', 27),
      discoverMovies('romance', 'Romances', 10749),
      discoverMovies('animation', 'Animación', 16),
      discoverMovies('documentary', 'Documentales', 99),
    ],
  },
  tv: {
    title: 'Series',
    description: 'Series de TV y originales de Netflix: dramas, comedias, crimen, ciencia ficción y más.',
    featured: { ...netflixOriginals, id: 'featured-tv', variant: 'default' },
    rows: [
      top10Tv,
      { id: 'popular-tv', title: 'Series populares', path: '/tv/popular', mediaType: 'tv' },
      netflixOriginals,
      { id: 'top-rated-tv', title: 'Series aclamadas', path: '/tv/top_rated', mediaType: 'tv' },
      discoverTv('drama-tv', 'Dramas', 18),
      discoverTv('crime-tv', 'Series de crimen', 80),
      discoverTv('comedy-tv', 'Comedias de TV', 35),
      discoverTv('scifi-tv', 'Ciencia ficción y fantasía', 10765),
      discoverTv('animation-tv', 'Series animadas', 16),
      discoverTv('docs-tv', 'Docuseries', 99),
    ],
  },
  movie: {
    title: 'Películas',
    description: 'Películas populares, estrenos, clásicos aclamados y lo más visto de hoy.',
    featured: { id: 'featured-movie', title: 'Destacada', path: '/movie/popular', mediaType: 'movie' },
    rows: [
      top10Movies,
      { id: 'now-playing', title: 'Estrenos', path: '/movie/now_playing', mediaType: 'movie' },
      { id: 'popular-movies', title: 'Películas populares', path: '/movie/popular', mediaType: 'movie' },
      { id: 'top-rated', title: 'Aclamadas por la crítica', path: '/movie/top_rated', mediaType: 'movie' },
      discoverMovies('action', 'Acción', 28),
      discoverMovies('thriller', 'Suspenso', 53),
      discoverMovies('scifi', 'Ciencia ficción', 878),
      discoverMovies('comedy', 'Comedias', 35),
      discoverMovies('family', 'Para ver en familia', 10751),
      discoverMovies('horror', 'Terror', 27),
    ],
  },
  latest: {
    title: 'Novedades populares',
    description: 'Lo nuevo y lo más popular de la semana en series y películas.',
    featured: { id: 'featured-latest', title: 'Destacada', path: '/trending/all/day', mediaType: 'movie' },
    rows: [
      { id: 'trending-day', title: 'Lo más visto hoy', path: '/trending/all/day', mediaType: 'movie' },
      { id: 'upcoming', title: 'Próximamente', path: '/movie/upcoming', mediaType: 'movie' },
      { id: 'on-the-air', title: 'Nuevos episodios', path: '/tv/on_the_air', mediaType: 'tv' },
      top10Tv,
      top10Movies,
      { id: 'airing-today', title: 'Se emiten hoy', path: '/tv/airing_today', mediaType: 'tv' },
    ],
  },
};
