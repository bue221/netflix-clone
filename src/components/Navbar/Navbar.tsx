import { useEffect, useId, useRef, useState } from 'react';
import { useScrolled } from '../../hooks/useScrolled';
import { NAV_ITEMS, type Route } from '../../routing/routes';
import { BellIcon, CaretDownIcon, CloseIcon, SearchIcon } from '../ui/Icons';
import { Logo } from '../ui/Logo';
import styles from './Navbar.module.css';

interface NavbarProps {
  route: Route;
  query: string;
  onQueryChange: (query: string) => void;
}

export function Navbar({ route, query, onQueryChange }: NavbarProps) {
  const scrolled = useScrolled(0);
  const clearSearchOnNavigate = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('a[href^="#/"]')) onQueryChange('');
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.solid : ''}`} onClick={clearSearchOnNavigate}>
      <a href="#/" className={styles.logo} aria-label="Netflix, ir a Inicio">
        <Logo />
      </a>

      <nav aria-label="Principal" className={styles.primary}>
        <BrowseMenu route={route} />
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <li key={item.route}>
              <a href={item.href} aria-current={item.route === route && !query ? 'page' : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.secondary}>
        <SearchBox query={query} onQueryChange={onQueryChange} />
        <span className={styles.kids}>Niños</span>
        <Dropdown
          label="Notificaciones"
          trigger={<BellIcon className={styles.icon} />}
          panelClassName={styles.notifications}
        >
          <p className={styles.empty}>No tienes notificaciones nuevas.</p>
        </Dropdown>
        <Dropdown
          label="Cuenta"
          trigger={
            <span className={styles.profile}>
              <Avatar />
              <CaretDownIcon className={styles.caret} />
            </span>
          }
        >
          <ul className={styles.menu}>
            <li className={styles.profileRow}>
              <Avatar /> Invitado
            </li>
            <li>
              <a href="#/mi-lista">Mi lista</a>
            </li>
            <li>
              <a href="https://help.netflix.com" target="_blank" rel="noreferrer">
                Centro de ayuda
              </a>
            </li>
          </ul>
        </Dropdown>
      </div>
    </header>
  );
}

function BrowseMenu({ route }: { route: Route }) {
  const current = NAV_ITEMS.find((item) => item.route === route) ?? NAV_ITEMS[0];
  return (
    <Dropdown
      label="Explorar"
      className={styles.browse}
      panelClassName={styles.browsePanel}
      trigger={
        <span className={styles.browseTrigger}>
          Explorar <CaretDownIcon />
        </span>
      }
    >
      <ul className={styles.browseList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.route}>
            <a href={item.href} aria-current={item === current ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </Dropdown>
  );
}

function SearchBox({ query, onQueryChange }: { query: string; onQueryChange: (query: string) => void }) {
  const [open, setOpen] = useState(query.length > 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    onQueryChange('');
    setOpen(false);
  };

  return (
    <search className={`${styles.search} ${open ? styles.searchOpen : ''}`}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Buscar"
        aria-expanded={open}
        aria-controls={inputId}
        onClick={() => (open ? inputRef.current?.focus() : setOpen(true))}
      >
        <SearchIcon className={styles.icon} />
      </button>
      <label htmlFor={inputId} className="visually-hidden">
        Títulos, personas, géneros
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        placeholder="Títulos, personas, géneros"
        value={query}
        tabIndex={open ? 0 : -1}
        autoComplete="off"
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && close()}
        onBlur={() => !query && setOpen(false)}
      />
      {query && (
        <button type="button" className={styles.clear} aria-label="Borrar búsqueda" onClick={close}>
          <CloseIcon />
        </button>
      )}
    </search>
  );
}

interface DropdownProps {
  label: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
}

/** Opens on hover (pointer devices) and on click/keyboard, closes on outside click or Escape. */
function Dropdown({ label, trigger, children, className, panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const onPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const onPointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdown} ${className ?? ''}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a')) setOpen(false);
      }}
    >
      <button
        type="button"
        className={styles.iconButton}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      <div id={panelId} className={`${styles.panel} ${panelClassName ?? ''}`} data-open={open} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <svg className={styles.avatar} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="4" fill="#0071eb" />
      <circle cx="11" cy="13" r="2" fill="#fff" />
      <circle cx="21" cy="13" r="2" fill="#fff" />
      <path d="M9 20c2 3 12 3 14 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
