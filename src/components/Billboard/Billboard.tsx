import { formatSeasons, matchPercentage, type Title } from '../../domain/title';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useCatalogService } from '../../services/CatalogServiceContext';
import { backdropSrcSet, imageUrl } from '../../services/tmdb/images';
import { useTitleActions } from '../../state/titleActions';
import { Button } from '../ui/Button';
import { InfoIcon, PlayIcon } from '../ui/Icons';
import styles from './Billboard.module.css';

interface BillboardProps {
  title: Title;
}

export function Billboard({ title }: BillboardProps) {
  const { openDetails } = useTitleActions();
  const catalogService = useCatalogService();
  // Details only enrich the billboard (logo, rating); the base title is enough to render.
  const { data: details } = useAsyncResource(`${title.mediaType}-${title.id}`, (signal) =>
    catalogService.loadDetails(title, signal),
  );

  const logo = imageUrl(details?.logoPath ?? null, 'w500');
  const match = matchPercentage(title.voteAverage);
  const seasons = formatSeasons(details?.seasons ?? null);

  return (
    <section className={styles.billboard} aria-labelledby="billboard-title">
      <div className={styles.media}>
        <img
          className={styles.backdrop}
          src={imageUrl(title.backdropPath, 'original') ?? undefined}
          srcSet={backdropSrcSet(title.backdropPath)}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
        <div className={styles.vignette} />
      </div>

      <div className={styles.info}>
        <h2 id="billboard-title" className={styles.title}>
          {logo ? <img className={styles.logo} src={logo} alt={title.name} /> : title.name}
        </h2>
        <p className={styles.meta}>
          {match && <span className={styles.match}>{match}% para ti</span>}
          {title.releaseYear && <span>{title.releaseYear}</span>}
          {seasons && <span>{seasons}</span>}
        </p>
        <p className={styles.overview}>{title.overview}</p>
        <div className={styles.actions}>
          <Button icon={<PlayIcon />} onClick={() => openDetails(title, { autoplay: true })}>
            Reproducir
          </Button>
          <Button variant="secondary" icon={<InfoIcon />} onClick={() => openDetails(title)}>
            Más información
          </Button>
        </div>
      </div>

      {details?.certification && (
        <span className={styles.rating} aria-label={`Clasificación ${details.certification}`}>
          {details.certification}
        </span>
      )}
    </section>
  );
}

export function BillboardSkeleton() {
  return (
    <div className={`${styles.billboard} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.info}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  );
}
