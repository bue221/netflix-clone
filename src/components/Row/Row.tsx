import { useId, useRef, useState } from 'react';
import { titleKey, type CatalogRow } from '../../domain/title';
import { TitleCard } from '../TitleCard/TitleCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons';
import styles from './Row.module.css';
import { useCarousel } from './useCarousel';

interface RowProps {
  row: CatalogRow;
}

const KEY_DELTAS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };

/**
 * Roving tabindex: each row is a single Tab stop and arrow keys move between cards,
 * so keyboard users do not have to tab through hundreds of titles.
 */
function useRovingFocus(trackRef: React.RefObject<HTMLUListElement | null>, count: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onFocus = (event: React.FocusEvent) => {
    const index = Number((event.target as HTMLElement).closest<HTMLElement>('[data-index]')?.dataset.index);
    if (Number.isInteger(index)) setActiveIndex(index);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else if (event.key in KEY_DELTAS) next = activeIndex + (KEY_DELTAS[event.key] ?? 0);
    else return;
    event.preventDefault();
    const target = trackRef.current?.querySelector<HTMLElement>(`[data-index="${Math.min(Math.max(next, 0), count - 1)}"] button`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  return { activeIndex: Math.min(activeIndex, count - 1), onFocus, onKeyDown };
}

export function Row({ row }: RowProps) {
  const headingId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const { page, pageCount, atStart, scrollByPage } = useCarousel(trackRef);
  const roving = useRovingFocus(trackRef, row.items.length);

  return (
    <section className={`${styles.row} ${styles[row.variant]}`} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          {row.title}
        </h2>
        {pageCount > 1 && (
          <ol className={styles.pager} aria-hidden="true">
            {Array.from({ length: pageCount }, (_, index) => (
              <li key={index} className={index === page ? styles.activePage : undefined} />
            ))}
          </ol>
        )}
      </div>

      <div className={styles.viewport}>
        {!atStart && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            tabIndex={-1}
            onClick={() => scrollByPage(-1)}
            aria-label={`Ver títulos anteriores de ${row.title}`}
          >
            <ChevronLeftIcon />
          </button>
        )}
        <ul ref={trackRef} className={styles.track} onFocus={roving.onFocus} onKeyDown={roving.onKeyDown}>
          {row.items.map((title, index) => (
            <li key={titleKey(title)} className={styles.item} data-index={index}>
              <TitleCard
                title={title}
                variant={row.variant}
                rank={row.variant === 'top10' ? index + 1 : undefined}
                tabIndex={index === roving.activeIndex ? 0 : -1}
              />
            </li>
          ))}
        </ul>
        {pageCount > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            tabIndex={-1}
            onClick={() => scrollByPage(1)}
            aria-label={`Ver más títulos de ${row.title}`}
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </section>
  );
}

export function RowSkeleton() {
  return (
    <div className={styles.row} aria-hidden="true">
      <div className={styles.header}>
        <div className={styles.skeletonHeading} />
      </div>
      <div className={`${styles.track} ${styles.skeletonTrack}`}>
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className={`${styles.item} ${styles.skeletonCard}`} style={{ animationDelay: `${index * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}
