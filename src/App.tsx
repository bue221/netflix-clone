import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Footer } from './components/Footer/Footer';
import { Navbar } from './components/Navbar/Navbar';
import type { Title } from './domain/title';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { BrowsePage } from './pages/BrowsePage';
import { useRoute, type Route } from './routing/routes';

// Not needed for the first paint; split out of the initial bundle.
const loadDetailModal = () => import('./components/DetailModal/DetailModal');
const DetailModal = lazy(() => loadDetailModal().then((module) => ({ default: module.DetailModal })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const MyListPage = lazy(() => import('./pages/MyListPage').then((module) => ({ default: module.MyListPage })));
import { VIEWS } from './services/catalog/definitions';
import { TitleActionsContext, type OpenDetailsOptions, type TitleActions } from './state/titleActions';

const SITE_NAME = 'Netflix';
const SEARCH_DEBOUNCE_MS = 350;

interface SelectedTitle {
  title: Title;
  autoplay: boolean;
}

function pageMeta(route: Route, query: string, selected: SelectedTitle | null) {
  if (selected) {
    return {
      title: `${selected.title.name} | ${SITE_NAME}`,
      description: selected.title.overview.slice(0, 160) || VIEWS.home.description,
    };
  }
  if (query) return { title: `Buscar: ${query} | ${SITE_NAME}`, description: VIEWS.home.description };
  if (route === 'my-list') return { title: `Mi lista | ${SITE_NAME}`, description: 'Tus series y películas guardadas.' };
  const view = VIEWS[route];
  return { title: route === 'home' ? `${SITE_NAME} | Series y películas` : `${view.title} | ${SITE_NAME}`, description: view.description };
}

export default function App() {
  const route = useRoute();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [selected, setSelected] = useState<SelectedTitle | null>(null);
  const [previousRoute, setPreviousRoute] = useState(route);

  if (route !== previousRoute) {
    setPreviousRoute(route);
    setSelected(null);
  }

  const detailsOpen = selected !== null;
  const actions = useMemo<TitleActions>(
    () => ({
      openDetails: (title: Title, options?: OpenDetailsOptions) =>
        setSelected({ title, autoplay: options?.autoplay ?? false }),
      detailsOpen,
    }),
    [detailsOpen],
  );
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  useEffect(() => {
    // Warm the modal chunk once the page is idle so the first "Más información" opens instantly.
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 2000));
    idle(() => void loadDetailModal());
  }, []);

  const closeDetails = useCallback(() => setSelected(null), []);
  const selectSimilar = useCallback((title: Title) => setSelected({ title, autoplay: false }), []);

  const activeQuery = query.trim() ? debouncedQuery : '';
  useDocumentMeta(pageMeta(route, activeQuery, selected));

  return (
    <TitleActionsContext value={actions}>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Navbar route={route} query={query} onQueryChange={setQuery} />
      <main id="main">
        <ErrorBoundary resetKey={`${route}:${activeQuery}`}>
          <Suspense fallback={<div className="page-fallback" aria-busy="true" />}>
            {activeQuery ? (
              <SearchPage query={activeQuery} />
            ) : route === 'my-list' ? (
              <MyListPage />
            ) : (
              <BrowsePage key={route} view={route} />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      {selected && (
        <ErrorBoundary resetKey={`${selected.title.mediaType}-${selected.title.id}`}>
          <Suspense fallback={null}>
            <DetailModal
              title={selected.title}
              autoplay={selected.autoplay}
              onSelect={selectSimilar}
              onClose={closeDetails}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </TitleActionsContext>
  );
}
