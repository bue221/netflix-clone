import { useEffect, useRef, useState } from 'react';
import { formatSeasons, matchPercentage, type Title } from '../../domain/title';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { canAutoplayBackgroundVideo, useIsActivelyVisible, useUserEngaged } from '../../hooks/useBackgroundVideo';
import { useCatalogService } from '../../services/CatalogServiceContext';
import { backdropSrcSet, imageUrl, logoSrcSet, posterSrcSet } from '../../services/tmdb/images';
import { useTitleActions } from '../../state/titleActions';
import { Button, IconButton } from '../ui/Button';
import { InfoIcon, PlayIcon, VolumeOffIcon, VolumeUpIcon } from '../ui/Icons';
import styles from './Billboard.module.css';
import { BillboardTrailer } from './BillboardTrailer';

interface BillboardProps {
  title: Title;
}

/** Like Netflix, the still image is shown first and the trailer takes over after a short pause. */
const TRAILER_START_DELAY_MS = 2500;
/** Once the trailer has played for a while the synopsis collapses so the video is visible. */
const COMPACT_AFTER_MS = 7000;
/** Matches the `w500` TMDB logo size requested below. */
const LOGO_WIDTH = 500;

export function Billboard({ title }: BillboardProps) {
  const { openDetails, detailsOpen } = useTitleActions();
  const catalogService = useCatalogService();
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useIsActivelyVisible(sectionRef);
  const [autoplayAllowed] = useState(canAutoplayBackgroundVideo);
  const engaged = useUserEngaged();
  const [trailerStarted, setTrailerStarted] = useState(false);
  const [compact, setCompact] = useState(false);
  const [muted, setMuted] = useState(true);

  // Details only enrich the billboard (logo, rating, trailer); the base title is enough to render.
  const { data: details } = useAsyncResource(`${title.mediaType}-${title.id}`, (signal) =>
    catalogService.loadDetails(title, signal),
  );
  const trailerKey = autoplayAllowed ? (details?.trailerKey ?? null) : null;
  const paused = !visible || detailsOpen;

  useEffect(() => {
    if (!trailerKey || trailerStarted || paused || !engaged) return;
    const timer = setTimeout(() => setTrailerStarted(true), TRAILER_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [trailerKey, trailerStarted, paused, engaged]);

  useEffect(() => {
    if (!trailerStarted || compact || paused) return;
    const timer = setTimeout(() => setCompact(true), COMPACT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [trailerStarted, compact, paused]);

  const logo = imageUrl(details?.logoPath ?? null, 'w500');
  const match = matchPercentage(title.voteAverage);
  const seasons = formatSeasons(details?.seasons ?? null);

  return (
    <section
      ref={sectionRef}
      className={`${styles.billboard} ${compact ? styles.compact : ''}`}
      aria-labelledby="billboard-title"
    >
      <div className={styles.media}>
        <picture>
          {/* Portrait screens get the poster, like the Netflix mobile app, instead of a heavily cropped backdrop. */}
          {title.posterPath && (
            <source media="(max-width: 800px)" srcSet={posterSrcSet(title.posterPath)} sizes="100vw" />
          )}
          <img
            className={styles.backdrop}
            src={imageUrl(title.backdropPath, 'original') ?? undefined}
            srcSet={backdropSrcSet(title.backdropPath)}
            sizes="100vw"
            alt=""
            fetchPriority="high"
          />
        </picture>
        {trailerStarted && trailerKey && <BillboardTrailer videoKey={trailerKey} muted={muted} paused={paused} />}
        <div className={styles.vignette} />
      </div>

      <div className={styles.info}>
        <h2 id="billboard-title" className={styles.title}>
          {logo ? (
            <img
              className={styles.logo}
              src={logo}
              srcSet={logoSrcSet(details?.logoPath ?? null)}
              sizes="(max-width: 800px) 45vw, 30vw"
              alt={title.name}
              width={LOGO_WIDTH}
              height={details?.logoAspectRatio ? Math.round(LOGO_WIDTH / details.logoAspectRatio) : undefined}
            />
          ) : (
            title.name
          )}
        </h2>
        <div className={styles.details}>
          <p className={styles.meta}>
            {match && <span className={styles.match}>{match}% para ti</span>}
            {title.releaseYear && <span>{title.releaseYear}</span>}
            {seasons && <span>{seasons}</span>}
          </p>
          <p className={styles.overview}>{title.overview}</p>
        </div>
        <div className={styles.actions}>
          <Button icon={<PlayIcon />} onClick={() => openDetails(title, { autoplay: true })}>
            Reproducir
          </Button>
          <Button variant="secondary" icon={<InfoIcon />} onClick={() => openDetails(title)}>
            Más información
          </Button>
        </div>
      </div>

      <div className={styles.side}>
        {trailerStarted && trailerKey && (
          <IconButton
            label={muted ? 'Activar sonido' : 'Silenciar'}
            aria-pressed={!muted}
            className={styles.mute}
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        )}
        {details?.certification && (
          <span className={styles.rating} aria-label={`Clasificación ${details.certification}`}>
            {details.certification}
          </span>
        )}
      </div>
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
