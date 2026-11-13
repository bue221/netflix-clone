import { config } from '../config/env';
import { createCatalogService } from './catalog/catalogService';
import { createTmdbClient } from './tmdb/client';

export const catalogService = createCatalogService({
  client: createTmdbClient({ apiKey: config.tmdbApiKey, language: config.tmdbLanguage }),
  language: config.tmdbLanguage,
  region: config.tmdbRegion,
});
