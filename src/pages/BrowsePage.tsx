import { Billboard, BillboardSkeleton } from '../components/Billboard/Billboard';
import { Row, RowSkeleton } from '../components/Row/Row';
import { StatusMessage } from '../components/StatusMessage/StatusMessage';
import { Button } from '../components/ui/Button';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useCatalogService } from '../services/CatalogServiceContext';
import { VIEWS, type BrowseView } from '../services/catalog/definitions';
import { toUserMessage } from '../services/tmdb/errors';
import styles from './BrowsePage.module.css';

export function BrowsePage({ view }: { view: BrowseView }) {
  const catalogService = useCatalogService();
  const definition = VIEWS[view];
  const catalog = useAsyncResource(view, (signal) => catalogService.loadView(definition, signal));

  if (catalog.status === 'error') {
    return (
      <StatusMessage
        tone="error"
        heading="No pudimos cargar el catálogo"
        action={<Button onClick={catalog.reload}>Reintentar</Button>}
      >
        {toUserMessage(catalog.error)}
      </StatusMessage>
    );
  }

  if (!catalog.data) {
    return (
      <div aria-busy="true" aria-label="Cargando catálogo">
        <BillboardSkeleton />
        <div className={styles.rows}>
          {Array.from({ length: 4 }, (_, index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const { featured, rows } = catalog.data;
  return (
    <>
      <h1 className="visually-hidden">{definition.title}</h1>
      {featured ? <Billboard key={`${featured.mediaType}-${featured.id}`} title={featured} /> : <div className={styles.spacer} />}
      <div className={`${styles.rows} ${featured ? '' : styles.noBillboard}`}>
        {rows.map((row) => (
          <Row key={row.id} row={row} />
        ))}
      </div>
    </>
  );
}
