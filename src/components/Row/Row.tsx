import { useId, useRef } from 'react';
import { titleKey, type CatalogRow } from '../../domain/title';
import { TitleCard } from '../TitleCard/TitleCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons';
import styles from './Row.module.css';
import { useCarousel } from './useCarousel';

interface RowProps {
  row: CatalogRow;
}

export function Row({ row }: RowProps) {
  const headingId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const { page, pageCount, atStart, scrollByPage } = useCarousel(trackRef);

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
            onClick={() => scrollByPage(-1)}
            aria-label={`Ver títulos anteriores de ${row.title}`}
          >
            <ChevronLeftIcon />
          </button>
        )}
        <ul ref={trackRef} className={styles.track}>
          {row.items.map((title, index) => (
            <li key={titleKey(title)} className={styles.item}>
              <TitleCard title={title} variant={row.variant} rank={row.variant === 'top10' ? index + 1 : undefined} />
            </li>
          ))}
        </ul>
        {pageCount > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
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
