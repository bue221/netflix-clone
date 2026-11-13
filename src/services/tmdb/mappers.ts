import type { MediaType, Title, TitleDetails } from '../../domain/title';
import type { TmdbDetails, TmdbListItem } from './types';

function parseYear(date: string | undefined): number | null {
  const year = Number.parseInt(date?.slice(0, 4) ?? '', 10);
  return Number.isFinite(year) ? year : null;
}

export function toTitle(item: TmdbListItem, fallbackType: MediaType): Title | null {
  const mediaType = item.media_type ?? fallbackType;
  if (mediaType === 'person') return null;
  return {
    id: item.id,
    mediaType,
    name: item.title ?? item.name ?? 'Sin título',
    overview: item.overview ?? '',
    backdropPath: item.backdrop_path ?? null,
    posterPath: item.poster_path ?? null,
    releaseYear: parseYear(item.release_date ?? item.first_air_date),
    voteAverage: item.vote_average ?? 0,
    genreIds: item.genre_ids ?? [],
  };
}

export function toTitles(items: readonly TmdbListItem[], fallbackType: MediaType): Title[] {
  return items.map((item) => toTitle(item, fallbackType)).filter((title): title is Title => title !== null);
}

function pickLogo(details: TmdbDetails, language: string) {
  const logos = details.images?.logos ?? [];
  const lang = language.split('-')[0];
  return (
    logos.find((logo) => logo.iso_639_1 === lang) ??
    logos.find((logo) => logo.iso_639_1 === 'en') ??
    logos[0]
  );
}

function pickTrailer(details: TmdbDetails): string | null {
  const youtube = (details.videos?.results ?? []).filter((video) => video.site === 'YouTube');
  const trailer =
    youtube.find((video) => video.type === 'Trailer' && video.official) ??
    youtube.find((video) => video.type === 'Trailer') ??
    youtube.find((video) => video.type === 'Teaser') ??
    youtube[0];
  return trailer?.key ?? null;
}

function pickCertification(details: TmdbDetails, region: string): string | null {
  const regions = [region, 'US'];
  for (const code of regions) {
    const tv = details.content_ratings?.results?.find((entry) => entry.iso_3166_1 === code)?.rating;
    if (tv) return tv;
    const movie = details.release_dates?.results
      ?.find((entry) => entry.iso_3166_1 === code)
      ?.release_dates.find((release) => release.certification)?.certification;
    if (movie) return movie;
  }
  return null;
}

/** TMDB often lacks a localized synopsis; fall back to another variant of the language, then English. */
function pickOverview(details: TmdbDetails, language: string): string {
  if (details.overview?.trim()) return details.overview;
  const lang = language.split('-')[0];
  const translations = (details.translations?.translations ?? []).filter((entry) => entry.data?.overview?.trim());
  const best =
    translations.find((entry) => entry.iso_639_1 === lang) ??
    translations.find((entry) => entry.iso_639_1 === 'en' && entry.iso_3166_1 === 'US') ??
    translations.find((entry) => entry.iso_639_1 === 'en');
  return best?.data?.overview ?? '';
}

export function toTitleDetails(
  details: TmdbDetails,
  mediaType: MediaType,
  { language, region }: { language: string; region: string },
): TitleDetails {
  const base = toTitle({ ...details, media_type: mediaType }, mediaType) as Title;
  const logo = pickLogo(details, language);
  return {
    ...base,
    overview: pickOverview(details, language),
    genres: (details.genres ?? []).map((genre) => genre.name),
    tagline: details.tagline ?? '',
    runtimeMinutes: details.runtime ?? details.episode_run_time?.[0] ?? null,
    seasons: details.number_of_seasons ?? null,
    logoPath: logo?.file_path ?? null,
    logoAspectRatio: logo?.aspect_ratio && logo.aspect_ratio > 0 ? logo.aspect_ratio : null,
    trailerKey: pickTrailer(details),
    certification: pickCertification(details, region),
    cast: [...(details.credits?.cast ?? [])]
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((member) => member.name),
    similar: pickSimilar(details, mediaType),
  };
}

/** TMDB recommendations are usually more relevant; `similar` is the fallback for niche titles. */
function pickSimilar(details: TmdbDetails, mediaType: MediaType): Title[] {
  for (const source of [details.recommendations, details.similar]) {
    const titles = toTitles(source?.results ?? [], mediaType).filter((title) => title.backdropPath);
    if (titles.length > 0) return titles;
  }
  return [];
}
