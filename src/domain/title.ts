export type MediaType = 'movie' | 'tv';

export interface Title {
  id: number;
  mediaType: MediaType;
  name: string;
  overview: string;
  backdropPath: string | null;
  posterPath: string | null;
  releaseYear: number | null;
  /** 0-10 TMDB community score. */
  voteAverage: number;
  genreIds: number[];
}

export interface TitleDetails extends Title {
  genres: string[];
  tagline: string;
  runtimeMinutes: number | null;
  seasons: number | null;
  logoPath: string | null;
  trailerKey: string | null;
  certification: string | null;
  cast: string[];
  similar: Title[];
}

export type RowVariant = 'default' | 'poster' | 'top10';

export interface CatalogRow {
  id: string;
  title: string;
  variant: RowVariant;
  items: Title[];
}

export function titleKey(title: Pick<Title, 'id' | 'mediaType'>): string {
  return `${title.mediaType}-${title.id}`;
}

/** Netflix shows a "% match" figure; we derive it from the community score. */
export function matchPercentage(voteAverage: number): number | null {
  if (!Number.isFinite(voteAverage) || voteAverage <= 0) return null;
  return Math.min(99, Math.round(voteAverage * 10));
}

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatSeasons(seasons: number | null): string | null {
  if (!seasons || seasons <= 0) return null;
  return seasons === 1 ? '1 temporada' : `${seasons} temporadas`;
}
