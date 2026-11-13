import { createContext, useContext } from 'react';
import type { CatalogService } from './catalog/catalogService';
import { catalogService } from './index';

/** Lets tests (or another data source) replace the TMDB-backed catalog. */
export const CatalogServiceContext = createContext<CatalogService>(catalogService);

export function useCatalogService(): CatalogService {
  return useContext(CatalogServiceContext);
}
