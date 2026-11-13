import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { genreNames } from '../../domain/genres';
import { matchPercentage, type Title } from '../../domain/title';
import { imageUrl } from '../../services/tmdb/images';
import { useMyList } from '../../state/myListStore';
import { useTitleActions } from '../../state/titleActions';
import { Artwork } from '../ui/Artwork';
import { IconButton } from '../ui/Button';
import { CheckIcon, ChevronDownIcon, PlayIcon, PlusIcon, ThumbUpIcon } from '../ui/Icons';
import styles from './HoverPreview.module.css';

interface HoverPreviewProps {
  title: Title;
  anchor: DOMRect;
  /** When true the preview plays its exit animation and then calls `onClose`. */
  leaving: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClose: () => void;
}

const SCALE = 1.5;
const MIN_WIDTH = 280;
const EXIT_MS = 160;

interface Placement {
  left: number;
  top: number;
  width: number;
  origin: 'left' | 'center' | 'right';
  fromScale: number;
}

export function computePlacement(anchor: DOMRect, viewportWidth: number, scrollY: number): Placement {
  const width = Math.max(anchor.width * SCALE, MIN_WIDTH);
  const gutter = viewportWidth * 0.04;
  const centered = anchor.left + anchor.width / 2 - width / 2;
  const minLeft = gutter;
  const maxLeft = viewportWidth - gutter - width;
  const left = Math.min(Math.max(centered, minLeft), Math.max(minLeft, maxLeft));
  const origin = left > centered ? 'left' : left < centered ? 'right' : 'center';
  const mediaHeight = (width * 9) / 16;
  return {
    left,
    top: anchor.top + scrollY + anchor.height / 2 - mediaHeight / 2,
    width,
    origin,
    fromScale: anchor.width / width,
  };
}

export function HoverPreview({ title, anchor, leaving, onPointerEnter, onPointerLeave, onClose }: HoverPreviewProps) {
  const { openDetails } = useTitleActions();
  const { isInList, toggle } = useMyList();
  const [liked, setLiked] = useState(false);
  const placement = computePlacement(anchor, document.documentElement.clientWidth, window.scrollY);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onClose, EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, onClose]);

  useEffect(() => {
    // Any horizontal row scroll or resize invalidates the anchor position.
    const dismiss = (event: Event) => {
      if (event.type === 'resize' || event.target !== document) onClose();
    };
    window.addEventListener('resize', dismiss);
    document.addEventListener('scroll', dismiss, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', dismiss);
      document.removeEventListener('scroll', dismiss, { capture: true });
    };
  }, [onClose]);

  const inList = isInList(title);
  const match = matchPercentage(title.voteAverage);
  const genres = genreNames(title.genreIds);
  const open = (autoplay: boolean) => {
    onClose();
    openDetails(title, { autoplay });
  };

  const style = {
    left: placement.left,
    top: placement.top,
    width: placement.width,
    transformOrigin: `${placement.origin} center`,
    '--from-scale': placement.fromScale,
  } as CSSProperties;

  return createPortal(
    <div
      className={`${styles.preview} ${leaving ? styles.leaving : ''}`}
      style={style}
      onPointerLeave={onPointerLeave}
      onPointerEnter={onPointerEnter}
      role="dialog"
      aria-label={title.name}
    >
      <button type="button" className={styles.media} onClick={() => open(false)} aria-label={`Más información de ${title.name}`}>
        <Artwork src={imageUrl(title.backdropPath, 'w780')} alt="" fallbackLabel={title.name} loading="eager" />
        <span className={styles.name}>{title.name}</span>
      </button>
      <div className={styles.body}>
        <div className={styles.actions}>
          <IconButton label="Reproducir" variant="solid" onClick={() => open(true)}>
            <PlayIcon />
          </IconButton>
          <IconButton
            label={inList ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
            aria-pressed={inList}
            onClick={() => toggle(title)}
          >
            {inList ? <CheckIcon /> : <PlusIcon />}
          </IconButton>
          <IconButton
            label={liked ? 'Ya no me gusta' : 'Me gusta'}
            aria-pressed={liked}
            className={liked ? styles.liked : undefined}
            onClick={() => setLiked((value) => !value)}
          >
            <ThumbUpIcon />
          </IconButton>
          <IconButton label="Más información" className={styles.more} onClick={() => open(false)}>
            <ChevronDownIcon />
          </IconButton>
        </div>
        <p className={styles.meta}>
          {match && <span className={styles.match}>{match}% para ti</span>}
          {title.releaseYear && <span>{title.releaseYear}</span>}
          <span className={styles.badge}>HD</span>
        </p>
        {genres.length > 0 && (
          <ul className={styles.genres}>
            {genres.map((genre) => (
              <li key={genre}>{genre}</li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
