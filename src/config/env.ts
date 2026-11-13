export interface AppConfig {
  tmdbApiKey: string;
  tmdbLanguage: string;
  /** ISO 3166-1 country used to pick age certifications, derived from the language (es-MX -> MX). */
  tmdbRegion: string;
}

const DEFAULT_LANGUAGE = 'es-MX';

export function readConfig(env: Record<string, string | undefined> = import.meta.env): AppConfig {
  const tmdbLanguage = env.VITE_TMDB_LANGUAGE?.trim() || DEFAULT_LANGUAGE;
  return {
    tmdbApiKey: env.VITE_TMDB_API_KEY?.trim() ?? '',
    tmdbLanguage,
    tmdbRegion: tmdbLanguage.split('-')[1]?.toUpperCase() ?? 'US',
  };
}

export const config = readConfig();
