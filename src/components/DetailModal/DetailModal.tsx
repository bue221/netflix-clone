import { useEffect, useRef, useState } from 'react';
import { formatRuntime, formatSeasons, matchPercentage, titleKey, type Title, type TitleDetails } from '../../domain/title';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useCatalogService } from '../../services/CatalogServiceContext';
import { toUserMessage } from '../../services/tmdb/errors';
import { imageUrl } from '../../services/tmdb/images';
import { useMyList } from '../../state/myListStore';
import { Artwork } from '../ui/Artwork';
import { Button, IconButton } from '../ui/Button';
import { CheckIcon, CloseIcon, PlayIcon, PlusIcon, ThumbUpIcon } from '../ui/Icons';
import styles from './DetailModal.module.css';

interface DetailModalProps {
  title: Title;
  autoplay: boolean;
  onSelect: (title: Title) => void;
  onClose: () => void;
}

const EXIT_MS = 200;

export function DetailModal({ title, autoplay, onSelect, onClose }: DetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const catalogService = useCatalogService();
  const details = useAsyncResource(titleKey(title), (signal) => catalogService.loadDetails(title, signal));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [title]);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  const requestClose = () => setClosing(true);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${closing ? styles.closing : ''}`}
      aria-labelledby="detail-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <article className={styles.panel}>
        <IconButton label="Cerrar" variant="solid" className={styles.close} onClick={requestClose} autoFocus>
          <CloseIcon />
        </IconButton>

        {details.status === 'error' ? (
          <ModalError title={title} message={toUserMessage(details.error)} onRetry={details.reload} />
        ) : (
          <ModalContent
            key={titleKey(title)}
            title={title}
            details={details.data}
            autoplay={autoplay}
            onSelect={onSelect}
          />
        )}
      </article>
    </dialog>
  );
}

interface ModalContentProps {
  title: Title;
  details: TitleDetails | undefined;
  autoplay: boolean;
  onSelect: (title: Title) => void;
}

function ModalContent({ title, details, autoplay, onSelect }: ModalContentProps) {
  const { isInList, toggle } = useMyList();
  const [playing, setPlaying] = useState(autoplay);
  const inList = isInList(title);
  const match = matchPercentage(title.voteAverage);
  const duration = details ? (formatSeasons(details.seasons) ?? formatRuntime(details.runtimeMinutes)) : null;
  const logo = imageUrl(details?.logoPath ?? null, 'w500');
  const trailerKey = details?.trailerKey ?? null;
  const showTrailer = playing && trailerKey;

  return (
    <>
      <header className={styles.hero}>
        {showTrailer ? (
          <iframe
            className={styles.trailer}
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={`Tráiler de ${title.name}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            <Artwork
              className={styles.backdrop}
              src={imageUrl(title.backdropPath, 'w1280')}
              alt=""
              fallbackLabel={title.name}
              loading="eager"
            />
            <div className={styles.heroInfo}>
              <h2 id="detail-title" className={styles.heroTitle}>
                {logo ? <img className={styles.logo} src={logo} alt={title.name} /> : title.name}
              </h2>
              <div className={styles.heroActions}>
                <Button
                  icon={<PlayIcon />}
                  onClick={() => setPlaying(true)}
                  disabled={details !== undefined && !trailerKey}
                  title={details !== undefined && !trailerKey ? 'Tráiler no disponible' : undefined}
                >
                  {details !== undefined && !trailerKey ? 'Sin tráiler' : 'Reproducir'}
                </Button>
                <IconButton
                  label={inList ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
                  aria-pressed={inList}
                  onClick={() => toggle(title)}
                >
                  {inList ? <CheckIcon /> : <PlusIcon />}
                </IconButton>
                <IconButton label="Me gusta">
                  <ThumbUpIcon />
                </IconButton>
              </div>
            </div>
          </>
        )}
      </header>

      <div className={styles.body}>
        {showTrailer && (
          <h2 id="detail-title" className={styles.inlineTitle}>
            {title.name}
          </h2>
        )}
        <div className={styles.columns}>
          <div>
            <p className={styles.meta}>
              {match && <span className={styles.match}>{match}% para ti</span>}
              {title.releaseYear && <span>{title.releaseYear}</span>}
              {duration && <span>{duration}</span>}
              {details?.certification && <span className={styles.badge}>{details.certification}</span>}
              <span className={styles.badge}>HD</span>
            </p>
            {details?.tagline && <p className={styles.tagline}>{details.tagline}</p>}
            <p className={styles.overview}>{title.overview || details?.overview || 'Sinopsis no disponible.'}</p>
          </div>
          <dl className={styles.facts}>
            {details === undefined ? (
              <div className={styles.factsSkeleton} aria-label="Cargando detalles" />
            ) : (
              <>
                {details.cast.length > 0 && <Fact label="Elenco" value={details.cast.join(', ')} />}
                {details.genres.length > 0 && <Fact label="Géneros" value={details.genres.join(', ')} />}
              </>
            )}
          </dl>
        </div>

        {details && details.similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similar-heading">
            <h3 id="similar-heading">Más títulos similares</h3>
            <ul>
              {details.similar.slice(0, 9).map((item) => (
                <SimilarCard key={titleKey(item)} title={item} onSelect={onSelect} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}:</dt> <dd>{value}</dd>
    </div>
  );
}

function SimilarCard({ title, onSelect }: { title: Title; onSelect: (title: Title) => void }) {
  const { isInList, toggle } = useMyList();
  const inList = isInList(title);
  const match = matchPercentage(title.voteAverage);
  return (
    <li className={styles.similarCard}>
      <button type="button" className={styles.similarMedia} onClick={() => onSelect(title)} aria-label={title.name}>
        <Artwork src={imageUrl(title.backdropPath, 'w300')} alt="" fallbackLabel={title.name} />
        <span className={styles.similarName}>{title.name}</span>
      </button>
      <div className={styles.similarBody}>
        <div className={styles.similarMeta}>
          <div>
            {match && <span className={styles.match}>{match}% para ti</span>}
            {title.releaseYear && <span>{title.releaseYear}</span>}
          </div>
          <IconButton
            label={inList ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
            aria-pressed={inList}
            onClick={() => toggle(title)}
          >
            {inList ? <CheckIcon /> : <PlusIcon />}
          </IconButton>
        </div>
        <p>{title.overview}</p>
      </div>
    </li>
  );
}

function ModalError({ title, message, onRetry }: { title: Title; message: string; onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <h2 id="detail-title">{title.name}</h2>
      <p>{message}</p>
      <Button onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
