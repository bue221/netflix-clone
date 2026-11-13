import styles from './Footer.module.css';

const LINKS = [
  'Audio descriptivo',
  'Centro de ayuda',
  'Tarjetas de regalo',
  'Prensa',
  'Relaciones con inversionistas',
  'Empleo',
  'Términos de uso',
  'Privacidad',
  'Avisos legales',
  'Preferencias de cookies',
  'Información corporativa',
  'Contáctanos',
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.links}>
        {LINKS.map((label) => (
          <li key={label}>
            <a href="https://help.netflix.com" target="_blank" rel="noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.attribution}>
        Proyecto de estudio sin fines comerciales. Datos e imágenes de{' '}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>
        ; este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
      </p>
      <p className={styles.copyright}>© 1997-{new Date().getFullYear()} Netflix clone</p>
    </footer>
  );
}
