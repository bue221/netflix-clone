import { useCallback, useEffect, useRef, useState } from 'react';
import type { RowVariant, Title } from '../../domain/title';
import { backdropSrcSet, imageUrl } from '../../services/tmdb/images';
import { useTitleActions } from '../../state/titleActions';
import { Artwork } from '../ui/Artwork';
import { HoverPreview } from './HoverPreview';
import styles from './TitleCard.module.css';

interface TitleCardProps {
  title: Title;
  variant?: RowVariant;
  rank?: number;
}

const HOVER_INTENT_MS = 450;
/** Grace period so moving the pointer from the card onto the preview does not close it. */
const LEAVE_GRACE_MS = 80;

function useHoverPreview(cardRef: React.RefObject<HTMLElement | null>) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [leaving, setLeaving] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(leaveTimer.current);
    },
    [],
  );

  const enter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setLeaving(false);
  }, []);

  const leave = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setLeaving(true), LEAVE_GRACE_MS);
  }, []);

  const scheduleOpen = useCallback(() => {
    enter();
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) setAnchor(rect);
    }, HOVER_INTENT_MS);
  }, [cardRef, enter]);

  const close = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setAnchor(null);
    setLeaving(false);
  }, []);

  return { anchor, leaving, scheduleOpen, enter, leave, close };
}

export function TitleCard({ title, variant = 'default', rank }: TitleCardProps) {
  const { openDetails } = useTitleActions();
  const cardRef = useRef<HTMLButtonElement>(null);
  const preview = useHoverPreview(cardRef);

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        className={`${styles.card} ${styles[variant]}`}
        onClick={() => openDetails(title)}
        onPointerEnter={(event) => event.pointerType === 'mouse' && preview.scheduleOpen()}
        onPointerLeave={preview.leave}
        aria-label={rank ? `${rank}. ${title.name}` : title.name}
      >
        {variant === 'top10' && rank !== undefined && <RankNumber rank={rank} />}
        <CardArtwork title={title} variant={variant} />
      </button>
      {preview.anchor && (
        <HoverPreview
          title={title}
          anchor={preview.anchor}
          leaving={preview.leaving}
          onPointerEnter={preview.enter}
          onPointerLeave={preview.leave}
          onClose={preview.close}
        />
      )}
    </>
  );
}

function CardArtwork({ title, variant }: { title: Title; variant: RowVariant }) {
  if (variant === 'default') {
    return (
      <span className={styles.art}>
        <Artwork
          className={styles.image}
          src={imageUrl(title.backdropPath, 'w300')}
          srcSet={backdropSrcSet(title.backdropPath)}
          sizes="(max-width: 500px) 50vw, (max-width: 800px) 34vw, (max-width: 1100px) 25vw, 18vw"
          alt=""
          fallbackLabel={title.name}
        />
        <span className={styles.caption} aria-hidden="true">
          {title.name}
        </span>
      </span>
    );
  }
  return (
    <span className={styles.art}>
      <Artwork className={styles.image} src={imageUrl(title.posterPath, 'w342')} alt="" fallbackLabel={title.name} />
    </span>
  );
}

function RankNumber({ rank }: { rank: number }) {
  return (
    <svg className={styles.rank} viewBox={rank >= 10 ? '0 0 160 154' : '0 0 100 154'} aria-hidden="true">
      <text x={rank >= 10 ? 4 : 10} y="140">
        {rank}
      </text>
    </svg>
  );
}
