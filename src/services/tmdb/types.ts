/** Subset of the TMDB v3 payloads this app consumes. */

export interface TmdbListItem {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TmdbImage {
  file_path: string;
  aspect_ratio?: number;
  iso_639_1: string | null;
  vote_average: number;
}

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbDetails extends TmdbListItem {
  genres?: { id: number; name: string }[];
  tagline?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  images?: { logos?: TmdbImage[] };
  videos?: { results?: TmdbVideo[] };
  credits?: { cast?: { name: string; order: number }[] };
  translations?: {
    translations?: { iso_639_1: string; iso_3166_1: string; data?: { overview?: string } }[];
  };
  recommendations?: TmdbPage<TmdbListItem>;
  similar?: TmdbPage<TmdbListItem>;
  content_ratings?: { results?: { iso_3166_1: string; rating: string }[] };
  release_dates?: {
    results?: { iso_3166_1: string; release_dates: { certification: string }[] }[];
  };
}
