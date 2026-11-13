import { useSyncExternalStore } from 'react';
import type { BrowseView } from '../services/catalog/definitions';

export type Route = BrowseView | 'my-list';

export interface NavItem {
  route: Route;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { route: 'home', label: 'Inicio', href: '#/' },
  { route: 'tv', label: 'Series', href: '#/series' },
  { route: 'movie', label: 'Películas', href: '#/peliculas' },
  { route: 'latest', label: 'Novedades populares', href: '#/novedades' },
  { route: 'my-list', label: 'Mi lista', href: '#/mi-lista' },
];

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  return NAV_ITEMS.find((item) => item.href.slice(1) === path)?.route ?? 'home';
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function useRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => parseRoute(window.location.hash),
    () => 'home',
  );
}
