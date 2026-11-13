import { StatusMessage } from '../components/StatusMessage/StatusMessage';
import { TitleGrid } from '../components/TitleGrid/TitleGrid';
import { Button } from '../components/ui/Button';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useCatalogService } from '../services/CatalogServiceContext';
import { toUserMessage } from '../services/tmdb/errors';

export function SearchPage({ query }: { query: string }) {
  const catalogService = useCatalogService();
  const trimmed = query.trim();
  const results = useAsyncResource(trimmed || null, (signal) => catalogService.search(trimmed, signal));

  if (results.status === 'error') {
    return (
      <StatusMessage
        tone="error"
        heading="La búsqueda falló"
        action={<Button onClick={results.reload}>Reintentar</Button>}
      >
        {toUserMessage(results.error)}
      </StatusMessage>
    );
  }

  if (results.status === 'success' && results.data.length === 0) {
    return (
      <StatusMessage heading={`No hay resultados para "${trimmed}"`}>
        Prueba con otro título, actor o género, por ejemplo “comedia” o “Stranger Things”.
      </StatusMessage>
    );
  }

  return (
    <div aria-busy={results.status === 'loading'}>
      <TitleGrid heading={`Resultados para "${trimmed}"`} titles={results.data ?? []} />
    </div>
  );
}
