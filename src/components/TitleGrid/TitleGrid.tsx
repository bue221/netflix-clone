import { titleKey, type Title } from '../../domain/title';
import { TitleCard } from '../TitleCard/TitleCard';
import styles from './TitleGrid.module.css';

interface TitleGridProps {
  heading: string;
  titles: readonly Title[];
}

export function TitleGrid({ heading, titles }: TitleGridProps) {
  return (
    <section className={styles.section} aria-labelledby="grid-heading">
      <h1 id="grid-heading" className={styles.heading}>
        {heading}
      </h1>
      <ul className={styles.grid}>
        {titles.map((title) => (
          <li key={titleKey(title)}>
            <TitleCard title={title} />
          </li>
        ))}
      </ul>
    </section>
  );
}
